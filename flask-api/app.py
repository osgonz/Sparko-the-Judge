import os
import bcrypt
import requests
import pprint as pp
from datetime import datetime
from flask import Flask, jsonify, session
from flaskext.mysql import MySQL
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api, reqparse
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler

SESSION_NOT_FOUND = 'Session not found'

load_dotenv()

app = Flask(__name__)
cors = CORS(app, supports_credentials=True)
mysql = MySQL()
api = Api(app)
parser = reqparse.RequestParser()


# CORS configurations
app.config['CORS_HEADERS'] = 'Content-Type'

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = os.getenv('MYSQL_DATABASE_USER')
app.config['MYSQL_DATABASE_PASSWORD'] = os.getenv('MYSQL_DATABASE_PASSWORD')
app.config['MYSQL_DATABASE_DB'] = os.getenv('MYSQL_DATABASE_DB')
app.config['MYSQL_DATABASE_HOST'] = os.getenv('MYSQL_DATABASE_HOST')
#app.config['MYSQL_DATABASE_PORT'] = 3307
#app.config['MYSQL_DATABASE_PORT'] = 8889


# Session configurations
app.config['SECRET_KEY'] = 'My secret placeholder string'

mysql.init_app(app)

ongoing_contest_data = dict()

# Scheduler object
sched = BackgroundScheduler(daemon=True)

def get_new_ongoing_contest_data(contest, cursor):
    try:
        _contestID = contest[0]
        # Get Ongoing Contest's Users and Problems data
        cursor.callproc('spGetOngoingContestUsersInfo', (_contestID,))
        usernameList = cursor.fetchall()
        cursor.callproc('spGetContestProblems', (_contestID,))
        problemList = cursor.fetchall()
        uvaUsernameDict = dict()
        icpcUsernameDict = dict()
        uvaProblemDict = dict()
        icpcProblemDict = dict()
        uvaUserProblemDict = dict()
        icpcUserProblemDict = dict()
        standingsDict = dict()

        # Extract each user's judges ids
        for username in usernameList:
            standingsDict[username[1]] = dict()
            standingsDict[username[1]]["score"] = 0
            standingsDict[username[1]]["totalTime"] = 0

            if username[2]:
                uvaUsernameDict[username[2]] = [username[0], username[1], username[4]]
                uvaUserProblemDict[username[1]] = dict()

            if username[3]:
                icpcUsernameDict[username[3]] = [username[0], username[1], username[4]]
                icpcUserProblemDict[username[1]] = dict()

        uvaUsernameCall = ','.join(str(x) for x in uvaUsernameDict.keys())
        icpcUsernameCall = ','.join(str(x) for x in icpcUsernameDict.keys())

        # Divide problems by judge
        for problem in problemList:
            if problem[1] == 0:
                icpcProblemDict[problem[2]] = [problem[3], problem[1], problem[4]]
            elif problem[1] == 1:
                uvaProblemDict[problem[2]] = [problem[3], problem[1], problem[4]]

        uvaProblemCall = ','.join(str(x) for x in uvaProblemDict.keys())
        icpcProblemCall = ','.join(str(x) for x in icpcProblemDict.keys())

        submissionsData = []

        # Get UVA submissions
        if uvaUsernameCall and uvaProblemCall:
            uvaCall = 'https://uhunt.onlinejudge.org/api/subs-pids/' + uvaUsernameCall + '/' + uvaProblemCall + '/0'
            uvaRequest = requests.get(uvaCall)
            uvaResult = uvaRequest.json()

            for user in uvaUsernameDict.keys():
                if str(user) in uvaResult:
                    userData = uvaUsernameDict.get(user)
                    submissions = uvaResult[str(user)]["subs"]

                    for submission in submissions:
                        if contest[1].timestamp() < submission[4] <= contest[2].timestamp():
                            problemData = uvaProblemDict.get(submission[1])
                            entry = dict()
                            entry["username"] = userData[1]
                            entry["problemName"] = problemData[0]
                            entry["judge"] = problemData[1]
                            entry["url"] = problemData[2]
                            entry["result"] = submission[2]
                            if submission[5] == 1:
                                entry["language"] = 'ANSI C'
                            elif submission[5] == 2:
                                entry["language"] = 'Java'
                            elif submission[5] == 3:
                                entry["language"] = 'C++'
                            elif submission[5] == 4:
                                entry["language"] = 'Pascal'
                            elif submission[5] == 5:
                                entry["language"] = 'C++11'
                            else:
                                entry["language"] = 'Other'
                            entry["submissionTime"] = datetime.fromtimestamp(submission[4])
                            submissionsData.append(entry)

                            if submission[1] in uvaUserProblemDict[userData[1]]:
                                if uvaUserProblemDict[userData[1]][submission[1]]["result"] < submission[2]:
                                    uvaUserProblemDict[userData[1]][submission[1]]["result"] = submission[2]
                                if submission[2] < 90:
                                    uvaUserProblemDict[userData[1]][submission[1]]["penalty"] += 1200
                                uvaUserProblemDict[userData[1]][submission[1]]["submissionCount"] += 1
                                if uvaUserProblemDict[userData[1]][submission[1]]["time"] < submission[4]:
                                    uvaUserProblemDict[userData[1]][submission[1]]["time"] = submission[4]
                            else:
                                userProblemInfo = dict()
                                userProblemInfo["result"] = submission[2]
                                userProblemInfo["penalty"] = 1200 if submission[2] < 90 else 0
                                userProblemInfo["submissionCount"] = 1
                                userProblemInfo["time"] = submission[4]
                                uvaUserProblemDict[userData[1]][submission[1]] = userProblemInfo

        # Get ICPC submissions
        if icpcUsernameCall and icpcProblemCall:
            icpcCall = 'https://icpcarchive.ecs.baylor.edu/uhunt/api/subs-pids/' + icpcUsernameCall + '/' + icpcProblemCall + '/0'
            icpcRequest = requests.get(icpcCall)
            icpcResult = icpcRequest.json()

            for user in icpcUsernameDict.keys():
                if str(user) in icpcResult:
                    userData = icpcUsernameDict.get(user)
                    submissions = icpcResult[str(user)]["subs"]

                    for submission in submissions:
                        if contest[1].timestamp() < submission[4] <= contest[2].timestamp():
                            problemData = icpcProblemDict.get(submission[1])
                            entry = dict()
                            entry["username"] = userData[1]
                            entry["problemName"] = problemData[0]
                            entry["judge"] = problemData[1]
                            entry["url"] = problemData[2]
                            entry["result"] = submission[2]
                            if submission[5] == 1:
                                entry["language"] = 'ANSI C'
                            elif submission[5] == 2:
                                entry["language"] = 'Java'
                            elif submission[5] == 3:
                                entry["language"] = 'C++'
                            elif submission[5] == 4:
                                entry["language"] = 'Pascal'
                            elif submission[5] == 5:
                                entry["language"] = 'C++11'
                            else:
                                entry["language"] = 'Other'
                            entry["submissionTime"] = datetime.fromtimestamp(submission[4])
                            submissionsData.append(entry)

                            if submission[1] in icpcUserProblemDict[userData[1]]:
                                if icpcUserProblemDict[userData[1]][submission[1]]["result"] < submission[2]:
                                    icpcUserProblemDict[userData[1]][submission[1]]["result"] = submission[2]
                                if submission[2] < 90:
                                    icpcUserProblemDict[userData[1]][submission[1]]["penalty"] += 1200
                                icpcUserProblemDict[userData[1]][submission[1]]["submissionCount"] += 1
                                if icpcUserProblemDict[userData[1]][submission[1]]["time"] < submission[4]:
                                    icpcUserProblemDict[userData[1]][submission[1]]["time"] = submission[4]
                            else:
                                userProblemInfo = dict()
                                userProblemInfo["result"] = submission[2]
                                userProblemInfo["penalty"] = 1200 if submission[2] < 90 else 0
                                userProblemInfo["submissionCount"] = 1
                                userProblemInfo["time"] = submission[4]
                                icpcUserProblemDict[userData[1]][submission[1]] = userProblemInfo

        scoresData = []

        # Calculate users' results for each problem
        for problem in problemList:
            scoreEntry = dict()
            if problem[1] == 0:
                for user in icpcUserProblemDict.keys():
                    if problem[2] in icpcUserProblemDict[user]:
                        entry = dict()
                        entry["username"] = user
                        entry["result"] = icpcUserProblemDict[user][problem[2]]["result"]
                        entry["submissionCount"] = icpcUserProblemDict[user][problem[2]]["submissionCount"]
                        entry["TimeDifference"] = icpcUserProblemDict[user][problem[2]]["time"] - contest[1].timestamp() + \
                                                  icpcUserProblemDict[user][problem[2]]["penalty"]
                        if entry["result"] == 90:
                            standingsDict[user]["score"] += 1
                            standingsDict[user]["totalTime"] += entry["TimeDifference"]
                        scoreEntry[user] = entry

            elif problem[1] == 1:
                for user in uvaUserProblemDict.keys():
                    if problem[2] in uvaUserProblemDict[user]:
                        entry = dict()
                        entry["username"] = user
                        entry["result"] = uvaUserProblemDict[user][problem[2]]["result"]
                        entry["submissionCount"] = uvaUserProblemDict[user][problem[2]]["submissionCount"]
                        entry["TimeDifference"] = uvaUserProblemDict[user][problem[2]]["time"] - contest[1].timestamp() + \
                                                  uvaUserProblemDict[user][problem[2]]["penalty"]
                        if entry["result"] == 90:
                            standingsDict[user]["score"] += 1
                            standingsDict[user]["totalTime"] += entry["TimeDifference"]
                        scoreEntry[user] = entry

            scoresData.append(scoreEntry)

        # Calculate standings positions for contest
        pos = 1
        for user in sorted(sorted(standingsDict, key=lambda k: standingsDict[k]["totalTime"]),
                           key=lambda k: standingsDict[k]["score"], reverse=True):
            standingsDict[user]["position"] = pos
            pos += 1

        standingsData = []
        # Gather standings info for contest
        for user in usernameList:
            entry = dict()
            entry["userID"] = user[0]
            entry["username"] = user[1]
            entry["country_name"] = user[4]
            entry["score"] = standingsDict[user[1]]["score"]
            entry["standing"] = standingsDict[user[1]]["position"]
            standingsData.append(entry)

        result = dict()
        result["submissions"] = submissionsData
        result["scores"] = scoresData
        result["standings"] = standingsData
        return result

    except Exception as e:
        raise e

def insert_finished_contest_data(contest, conn, cursor):
    try:
        _contestID = contest[0]
        # Get Finished Contest's Users and Problems data
        cursor.callproc('spGetOngoingContestUsersInfo', (_contestID,))
        usernameList = cursor.fetchall()
        cursor.callproc('spGetContestProblems', (_contestID,))
        problemList = cursor.fetchall()
        uvaUsernameDict = dict()
        icpcUsernameDict = dict()
        uvaProblemDict = dict()
        icpcProblemDict = dict()
        uvaUserProblemDict = dict()
        icpcUserProblemDict = dict()
        standingsDict = dict()

        # Extract each user's judges ids
        for username in usernameList:
            standingsDict[username[1]] = dict()
            standingsDict[username[1]]["score"] = 0
            standingsDict[username[1]]["totalTime"] = 0

            if username[2]:
                uvaUsernameDict[username[2]] = [username[0], username[1], username[4]]
                uvaUserProblemDict[username[1]] = dict()

            if username[3]:
                icpcUsernameDict[username[3]] = [username[0], username[1], username[4]]
                icpcUserProblemDict[username[1]] = dict()

        uvaUsernameCall = ','.join(str(x) for x in uvaUsernameDict.keys())
        icpcUsernameCall = ','.join(str(x) for x in icpcUsernameDict.keys())

        # Divide problems by judge
        for problem in problemList:
            if problem[1] == 0:
                icpcProblemDict[problem[2]] = [problem[3], problem[1], problem[4], problem[0]]
            elif problem[1] == 1:
                uvaProblemDict[problem[2]] = [problem[3], problem[1], problem[4], problem[0]]

        uvaProblemCall = ','.join(str(x) for x in uvaProblemDict.keys())
        icpcProblemCall = ','.join(str(x) for x in icpcProblemDict.keys())

        # Get UVA submissions
        if uvaUsernameCall and uvaProblemCall:
            uvaCall = 'https://uhunt.onlinejudge.org/api/subs-pids/' + uvaUsernameCall + '/' + uvaProblemCall + '/0'
            uvaRequest = requests.get(uvaCall)
            uvaResult = uvaRequest.json()

            for user in uvaUsernameDict.keys():
                if str(user) in uvaResult:
                    userData = uvaUsernameDict.get(user)
                    submissions = uvaResult[str(user)]["subs"]

                    for submission in submissions:
                        if contest[1].timestamp() < submission[4] <= contest[2].timestamp():
                            problemData = uvaProblemDict.get(submission[1])
                            entry = dict()
                            entry["submitter"] = userData[0]
                            entry["problemID"] = problemData[3]
                            entry["result"] = submission[2]
                            if submission[5] == 1:
                                entry["language"] = 'ANSI C'
                            elif submission[5] == 2:
                                entry["language"] = 'Java'
                            elif submission[5] == 3:
                                entry["language"] = 'C++'
                            elif submission[5] == 4:
                                entry["language"] = 'Pascal'
                            elif submission[5] == 5:
                                entry["language"] = 'C++11'
                            else:
                                entry["language"] = 'Other'
                            entry["submissionTime"] = datetime.fromtimestamp(submission[4])
                            # INSERT SUBMISSION HERE
                            cursor.callproc('spInsertSubmission', (entry["submissionTime"], entry["result"], entry["language"], entry["problemID"], entry["submitter"], _contestID))
                            insertResult = cursor.fetchall()

                            if len(insertResult) is not 0:
                                conn.rollback()
                                return 100

                            if submission[1] in uvaUserProblemDict[userData[1]]:
                                if uvaUserProblemDict[userData[1]][submission[1]]["result"] < submission[2]:
                                    uvaUserProblemDict[userData[1]][submission[1]]["result"] = submission[2]
                                if submission[2] < 90:
                                    uvaUserProblemDict[userData[1]][submission[1]]["penalty"] += 1200
                                if uvaUserProblemDict[userData[1]][submission[1]]["time"] < submission[4]:
                                    uvaUserProblemDict[userData[1]][submission[1]]["time"] = submission[4]
                            else:
                                userProblemInfo = dict()
                                userProblemInfo["result"] = submission[2]
                                userProblemInfo["penalty"] = 1200 if submission[2] < 90 else 0
                                userProblemInfo["time"] = submission[4]
                                uvaUserProblemDict[userData[1]][submission[1]] = userProblemInfo

        # Get ICPC submissions
        if icpcUsernameCall and icpcProblemCall:
            icpcCall = 'https://icpcarchive.ecs.baylor.edu/uhunt/api/subs-pids/' + icpcUsernameCall + '/' + icpcProblemCall + '/0'
            icpcRequest = requests.get(icpcCall)
            icpcResult = icpcRequest.json()

            for user in icpcUsernameDict.keys():
                if str(user) in icpcResult:
                    userData = icpcUsernameDict.get(user)
                    submissions = icpcResult[str(user)]["subs"]

                    for submission in submissions:
                        if contest[1].timestamp() < submission[4] <= contest[2].timestamp():
                            problemData = icpcProblemDict.get(submission[1])
                            entry = dict()
                            entry["submitter"] = userData[0]
                            print(problemData)
                            entry["problemID"] = problemData[3]
                            entry["result"] = submission[2]
                            if submission[5] == 1:
                                entry["language"] = 'ANSI C'
                            elif submission[5] == 2:
                                entry["language"] = 'Java'
                            elif submission[5] == 3:
                                entry["language"] = 'C++'
                            elif submission[5] == 4:
                                entry["language"] = 'Pascal'
                            elif submission[5] == 5:
                                entry["language"] = 'C++11'
                            else:
                                entry["language"] = 'Other'
                            entry["submissionTime"] = datetime.fromtimestamp(submission[4])
                            # INSERT SUBMISSION HERE
                            cursor.callproc('spInsertSubmission', (entry["submissionTime"], entry["result"], entry["language"], entry["problemID"], entry["submitter"], _contestID))
                            insertResult = cursor.fetchall()

                            if len(insertResult) is not 0:
                                conn.rollback()
                                return 100

                            if submission[1] in icpcUserProblemDict[userData[1]]:
                                if icpcUserProblemDict[userData[1]][submission[1]]["result"] < submission[2]:
                                    icpcUserProblemDict[userData[1]][submission[1]]["result"] = submission[2]
                                if submission[2] < 90:
                                    icpcUserProblemDict[userData[1]][submission[1]]["penalty"] += 1200
                                if icpcUserProblemDict[userData[1]][submission[1]]["time"] < submission[4]:
                                    icpcUserProblemDict[userData[1]][submission[1]]["time"] = submission[4]
                            else:
                                userProblemInfo = dict()
                                userProblemInfo["result"] = submission[2]
                                userProblemInfo["penalty"] = 1200 if submission[2] < 90 else 0
                                userProblemInfo["time"] = submission[4]
                                icpcUserProblemDict[userData[1]][submission[1]] = userProblemInfo

        # Calculate users' results for each problem
        for problem in problemList:
            if problem[1] == 0:
                for user in icpcUserProblemDict.keys():
                    if problem[2] in icpcUserProblemDict[user]:
                        if icpcUserProblemDict[user][problem[2]]["result"] == 90:
                            standingsDict[user]["score"] += 1
                            standingsDict[user]["totalTime"] += icpcUserProblemDict[user][problem[2]]["time"] - contest[1].timestamp() + icpcUserProblemDict[user][problem[2]]["penalty"]

            elif problem[1] == 1:
                for user in uvaUserProblemDict.keys():
                    if problem[2] in uvaUserProblemDict[user]:
                        if uvaUserProblemDict[user][problem[2]]["result"] == 90:
                            standingsDict[user]["score"] += 1
                            standingsDict[user]["totalTime"] += uvaUserProblemDict[user][problem[2]]["time"] - contest[1].timestamp() + uvaUserProblemDict[user][problem[2]]["penalty"]

        # Calculate standings positions for contest
        pos = 1
        for user in sorted(sorted(standingsDict, key=lambda k: standingsDict[k]["totalTime"]),
                           key=lambda k: standingsDict[k]["score"], reverse=True):
            standingsDict[user]["position"] = pos
            pos += 1

        # Gather standings info for contest
        for user in usernameList:
            # UPDATE ContestUser
            cursor.callproc('spUpdateContestUser', (standingsDict[user[1]]["score"], standingsDict[user[1]]["position"], _contestID, user[0]))
            updateResult = cursor.fetchall()

            if len(updateResult) is not 0:
                conn.rollback()
                return 100

        cursor.callproc('spUpdateContestOngoingToFinished', (contest[3],))
        updateResult = cursor.fetchall()

        if len(updateResult) is 0:
            conn.commit()
            print(_contestID)
            return 200
        else:
            conn.rollback()
            return 100
    except Exception as e:
        raise e

def update_ongoing_contest_data():
    print('Hello Job! The time is: %s' % datetime.now())
    # Open MySQL connection
    conn = mysql.connect()
    cursor = conn.cursor()

    temp_data = dict()

    try:
        # Check if any Upcoming contests have started
        cursor.callproc('spUpdateContestUpcomingToOngoing')
        updateData = cursor.fetchall()

        if len(updateData) is 0:
            conn.commit()

        # Get Almost Finished Contests data
        cursor.callproc('spGetAlmostFinishedContestInfo')
        finished = cursor.fetchall()

        for contest in finished:
            result = insert_finished_contest_data(contest, conn, cursor)
            print(result)

        # Get Ongoing Contests data
        cursor.callproc('spGetOngoingContestInfo')
        contests = cursor.fetchall()

        for contest in contests:
            temp_data[contest[0]] = get_new_ongoing_contest_data(contest, cursor)
            print(contest[0])
            pp.pprint(temp_data[contest[0]])

        global ongoing_contest_data
        ongoing_contest_data = temp_data

    except Exception as e:
        raise e

    finally:
        cursor.close()
        conn.close()
        print('Bye Job! The time is: %s' % datetime.now())

sched.add_job(update_ongoing_contest_data, 'interval', minutes=5)

sched.start()
update_ongoing_contest_data()

class CreateUser(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Username address to create user')
            parser.add_argument('password', type=str, help='Password to create user')
            parser.add_argument('fname', type=str, help='First name to create user')
            parser.add_argument('lname', type=str, help='Last name to create user')
            parser.add_argument('email', type=str, help='Email name to create user')
            parser.add_argument('usertype', type=str, help='Type name to create user')

            args = parser.parse_args()

            _userName = args['username']
            _userPassword = bcrypt.hashpw(args['password'].encode('utf8'), bcrypt.gensalt())
            _userFName = args['fname']
            _userLName = args['lname']
            _userEmail = args['email']
            _userType = args['usertype']

            cursor.callproc('spCreateUser',(_userName,_userPassword, _userFName, _userLName, _userEmail, _userType))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                session['loggedUser'] = _userName
                return {'StatusCode':'200','Message': 'User creation success'}
            else:
                return {'StatusCode':'1000','Message': data[0][0]}

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class AuthenticateUser(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Username address to create user')
            parser.add_argument('password', type=str, help='Password to create user')

            args = parser.parse_args()

            _userName = args['username']
            _userPassword = args['password']

            cursor.callproc('spAuthentication', (_userName,))
            data = cursor.fetchall()

            if(len(data)>0):
                hashed_password = data[0][4]
                if bcrypt.checkpw(_userPassword.encode('utf8'), hashed_password.encode('utf8')):
                    user_id = data[0][0]
                    user_type = data[0][6]
                    session['loggedUser'] = _userName
                    return {'status':200,'UserId':str(user_id),'userType':user_type}
                else:
                    return {'status':100,'message':'Authentication failure'}

            return {'status':100,'message':'Authentication failure'}

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class EditUser(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('new_username', type=str, help='Username')
            parser.add_argument('fname', type=str, help='First name')
            parser.add_argument('lname', type=str, help='Last name')
            parser.add_argument('email', type=str, help='Email')
            parser.add_argument('country', type=str, help='Country')

            args = parser.parse_args()

            _username = session.get('loggedUser', SESSION_NOT_FOUND)
            _newUsername = args['new_username']
            _fname = args['fname']
            _lname = args['lname']
            _email = args['email']
            _country = args['country'] if args['country'] != 0 else None

            assert _username != SESSION_NOT_FOUND, 'No session found'

            cursor.callproc('spEdituser', (_username, _newUsername, _fname, _lname, _email, _country))
            data = cursor.fetchall()

            if(len(data) == 0):
                conn.commit()
                session['loggedUser'] = _newUsername
                return {'status': 200, 'message': 'User edit succesful'}
            else:
                return {'status': 100, 'message': data[0][0]}

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class EditUserJudgesUsernames(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser.add_argument('username_UVA', type=str, help='Username for UVA Online Judge')
            parser.add_argument('username_ICPC', type=str, help='Username for ICPC Live Archive Online Judge')

            args = parser.parse_args()

            _username = session.get('loggedUser', SESSION_NOT_FOUND)
            _usernameUVA = args['username_UVA'] if args['username_UVA'] != '' else None
            _usernameICPC = args['username_ICPC'] if args['username_ICPC'] != '' else None

            assert _username != SESSION_NOT_FOUND, 'No session found'

            cursor.callproc('spEditJudgesUsernames', (_username, _usernameUVA, _usernameICPC))
            data = cursor.fetchall()

            if(len(data) == 0):
                conn.commit()
                return {'status': 200, 'message': 'Online judges edit succesful'}
            else:
                return {'status': 100, 'message': data[0][0]}

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class GetUser(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            _username = session.get('loggedUser', SESSION_NOT_FOUND)
            print('Get user', _username)

            cursor.callproc('spAuthentication', (_username,))
            data = cursor.fetchall()
            cursor.callproc('spGetCountries')
            data2 = cursor.fetchall()
            _countries = []

            if(len(data) > 0 and len(data2) > 0):
                _fname, _lname, _email, _country, _username_uva, _username_icpc = data[0][2], data[0][3], data[0][5], data[0][7], data[0][8], data[0][9]
                for country in data2:
                    _countries.append(country[0])
                return {
                    'status': 200,
                    'username': _username,
                    'fname': _fname,
                    'lname': _lname,
                    'email': _email,
                    'country': _country,
                    'countries': _countries,
                    'username_uva': _username_uva,
                    'username_icpc': _username_icpc,
                }
            else:
                return {'status': 100, 'message': 'User not found'}

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class EditPassword(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('newPassword', type=str, help='User')
            parser.add_argument('password', type=str, help='User')

            args = parser.parse_args()

            _username = session.get('loggedUser', SESSION_NOT_FOUND)
            _password = args['password']
            _newPassword = bcrypt.hashpw(args['newPassword'].encode('utf8'), bcrypt.gensalt())

            assert _username != SESSION_NOT_FOUND, 'No session found'

            cursor.callproc('spAuthentication', (_username,))
            data = cursor.fetchall()
            hashed_password = data[0][4]
            if bcrypt.checkpw(_password.encode('utf8'), hashed_password.encode('utf8')):
                cursor.callproc('spEditPassword', (_username, _newPassword))
                data = cursor.fetchall()
                if(len(data) == 0):
                    conn.commit()
                    return {'status': 200, 'message': 'Password edit succesful'}
                else:
                    return {'status': 100, 'message': data[0][0]}
            else:
                return {'status': 100, 'message': 'Incorrect password'}

        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class IsLoggedUserContestOwner(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            username = session.get('loggedUser', SESSION_NOT_FOUND)

            cursor.callproc('spGetContestOwner', (_contest,))
            ownerData = cursor.fetchall()
            _owner = ownerData[0][0]

            if username == _owner:
                return jsonify({'status': 200})
            else:
                return jsonify({'status': 100, 'message': 'User not owner'})
            _
        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class GetContestInfo(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            username = session.get('loggedUser', SESSION_NOT_FOUND)

            if username != 'Session not found':
                cursor.callproc('spGetUserID', (username,))
                userData = cursor.fetchall()
                _userID = userData[0][0]

                if _userID:
                    cursor.callproc('spGetContestUserUsername', (_userID, _contest,))
                    validData = cursor.fetchall()

                    cursor.callproc('spGetContestInformation', (_contest,))
                    contestData = cursor.fetchall();

                    if len(contestData) > 0:
                        data = [dict((cursor.description[i][0], value)
                                     for i, value in enumerate(row)) for row in contestData]
                        return jsonify({'status': 200,
                                        'contestInfo': data[0],
                                        'isParticipant': len(validData) > 0})
                    else:
                        return jsonify ({'status': 100, 'message': 'Contest not found'})
                else:
                    return jsonify ({'status': 100, 'message': 'User not found'})
            else:
                return jsonify({'status': 100, 'message': 'Session not found'})
            _
        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class GetContestProblems(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            cursor.callproc('spGetContestProblems', (_contest,))
            data = [dict((cursor.description[i][0], value)
                        for i, value in enumerate(row)) for row in cursor.fetchall()]
            return jsonify({'status': 200,
                            'problemList': data})
            _
        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class GetContestStandings(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            cursor.callproc('spGetContestStandings', (_contest,))
            data = [dict((cursor.description[i][0], value)
                        for i, value in enumerate(row)) for row in cursor.fetchall()]
            return jsonify({'status': 200,
                            'standingsList': data})
            _
        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class GetSubmissionsInContest(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            cursor.callproc('spGetSubmissionsInContest', (_contest,))
            data = [dict((cursor.description[i][0], value)
                        for i, value in enumerate(row)) for row in cursor.fetchall()]
            return jsonify({'status': 200,
                            'submissionsList': data})
            _
        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class GetUserSubmissionsInContest(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            username = session.get('loggedUser', 'Session not found')

            if username != 'Session not found':
                cursor.callproc('spGetUserID', (username,))
                userData = cursor.fetchall()
                _userID = userData[0][0]

                if _userID:
                    cursor.callproc('spGetUserSubmissionsInContest', (_userID, _contest,))
                    data = [dict((cursor.description[i][0], value)
                                 for i, value in enumerate(row)) for row in cursor.fetchall()]
                    return jsonify({'status': 200,
                                    'userSubmissionsList': data})
                else:
                    return jsonify({'status': 100, 'message': 'User not found'})
            else:
                return jsonify({'status': 100, 'message': 'Session not found'})
            _
        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class GetContestScoresPerProblem(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')
            parser.add_argument('problem_id_list', type=str, help='List of problem identifier numbers', action='append')

            args = parser.parse_args()

            _contest = args['contest_id']
            _problemList = args['problem_id_list']
            solutionList = []

            for _problem in _problemList:
                cursor.callproc('spGetContestScoresPerProblem', (_problem, _contest,))
                data = [dict((cursor.description[i][0], value)
                                 for i, value in enumerate(row)) for row in cursor.fetchall()]
                newData = dict((row['username'], row) for row in data)
                solutionList.append(newData)

            return jsonify({'status': 200, 'scoreList': solutionList})

        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class GetUserList(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('usertype', type=str, help='User type')

            args = parser.parse_args()

            _username = session.get('loggedUser', SESSION_NOT_FOUND)
            _usertype = args['usertype']

            cursor.callproc('spGetUserList', (_usertype,))
            data = cursor.fetchall()

            if(len(data)>0):
                r = [dict((cursor.description[i][0], value)
                        for i, value in enumerate(row)) for row in data]
                return jsonify({'status': 'SUCCESS',
                                'userList': r})
            else:
                return {'status':100,'message':'Authentication failure'}

        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class BanUsers(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('usernames', action='append', help='Users to ban')
            args = parser.parse_args()

            _usersBanned = args['usernames']

            for userID in _usersBanned:
                cursor.callproc('spBanUser', (userID,))

            conn.commit()
            return jsonify({'status': 'SUCCESS'})

        except Exception as e:
            raise e

        finally:
            cursor.close()
            conn.close()

class UnbanUsers(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('usernames', action='append', help='Users to unbban')
            args = parser.parse_args()

            _usersBanned = args['usernames']

            sql = '''UPDATE users
                    SET usertype = 1
                    WHERE userID = %s'''
            for userID in _usersBanned:
                data = (userID, )
                cursor.execute(sql, data)

            conn.commit()
            return jsonify({'status': 'SUCCESS'})

        except Exception as e:
            raise e
        
        finally:
            cursor.close()
            conn.close()

class CreateContest(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contestName', type=str, help='Contest name to create contest')
            parser.add_argument('description', type=str, help='Contest description to create contest')
            parser.add_argument('startDate', help='Contest start date to create contest')
            parser.add_argument('endDate', help='Contest end date to create contest')
            parser.add_argument('status', type=int, help='Contest status to create contest')

            args = parser.parse_args()

            _contestName = args['contestName']
            _contestDescription = args['description']
            _contestStartDate = args['startDate']
            _contestEndDate = args['endDate']
            _contestStatus = args['status']
            _contestOwnerUsername = session.get('loggedUser')

            cursor.callproc('spCreateContest', (
            _contestName, _contestDescription, _contestStartDate, _contestEndDate, _contestStatus,
            _contestOwnerUsername))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.callproc('spGetLastInsertedID')
                data = cursor.fetchall()
                contestID = data[0][0]
                return {'StatusCode':200,'Message': 'Contest creation success', 'contestID': contestID}
            else:
                return {'StatusCode': 1000, 'Message': str(data[0])}

        except Exception as e:
            return {'error': str(e)}
        
        finally:
            cursor.close()
            conn.close()
            
class GetUserID(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('email', type=str, help='email to find userID')

            args = parser.parse_args()

            _email = args['email']

            cursor.callproc('spUserID', (_email,))
            data = cursor.fetchall()

            if len(data) > 0:
                return {'StatusCode': '200', 'Message': 'UserID found'}
            else:
                return {'StatusCode': '1000', 'Message': str(data[0])}

        except Exception as e:
            return {'error': str(e)}
        
        finally:
            cursor.close()
            conn.close()

class ViewOwnedContestList(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner username')

            args = parser.parse_args()

            _ownerUsername = args['username']

            cursor.callproc('spGetOwnedContests', (_ownerUsername,))
            data = [dict((cursor.description[i][0], value)
                         for i, value in enumerate(row)) for row in cursor.fetchall()]

            if len(data) >= 0:
                return jsonify({'StatusCode': 200, 'ownedContestList': data})
            else:
                return jsonify({'StatusCode': 1000, 'Message': 'No owned contests'})

        except Exception as e:
            print(str(e))
            return {'error': str(e)}
       
        finally:
            cursor.close()
            conn.close()
            
class ViewInvitedContestList(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Current username')

            args = parser.parse_args()

            _username = args['username']

            cursor.callproc('spGetInvitedContests', (_username,))
            data = [dict((cursor.description[i][0], value)
                         for i, value in enumerate(row)) for row in cursor.fetchall()]

            if len(data) >= 0:
                return jsonify({'StatusCode': 200, 'invitedContestList': data})
            else:
                return jsonify({'StatusCode': 1000, 'Message': 'No invited contests'})

        except Exception as e:
            print(str(e))
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class EditContest(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contestID', type=int, help='Contest ID')
            parser.add_argument('contestName', type=str, help='Contest Name')
            parser.add_argument('description', type=str, help='Description')
            parser.add_argument('startDate', help='startDate')
            parser.add_argument('endDate', help='endDate')
            parser.add_argument('status', type=int, help='status')
            parser.add_argument('problemsToAdd', type=dict, action='append', help='Problems to add to contest.')
            parser.add_argument('problemsToDelete', type=dict, action='append', help='Problems to delete from contest.')
            parser.add_argument('usersToAdd', type=dict, action='append', help='Users to add to contest.')
            parser.add_argument('usersToDelete', type=dict, action='append', help='Users to delete from contest.')

            args = parser.parse_args()

            _contestID = args['contestID']
            _contestName = args['contestName']
            _description = args['description']
            _startDate = args['startDate']
            _endDate = args['endDate']
            _status = args['status']
            _problemsToAdd = args['problemsToAdd']
            _problemsToDelete = args['problemsToDelete']
            _usersToAdd = args['usersToAdd']
            _usersToDelete = args['usersToDelete']

            cursor.callproc('spEditContest', (_contestID, _contestName, _description, _startDate, _endDate, _status))
            data = cursor.fetchall()

            if (len(data) == 0):
                # Checking for None because if no probles is added, Javascript sends an empty list and Flask receives it as None
                if _problemsToAdd is not None:
                    for problem in _problemsToAdd:
                        cursor.callproc('spAddProblemToContest', (_contestID, problem['problemName']))

                # Same as above
                if _problemsToDelete is not None:
                    for problem in _problemsToDelete:
                        cursor.callproc('spRemoveProblemFromContest', (_contestID, problem['problemName']))

                if _usersToAdd is not None:
                    for user in _usersToAdd:
                        cursor.callproc('spAddUserToContest', (user['username'], _contestID))

                if _usersToDelete is not None:
                    for user in _usersToDelete:
                        cursor.callproc('spRemoveUserFromContest', (user['username'], _contestID))

                conn.commit()
                return {'status': 200, 'message': 'Contest edit succesful'}
            else:
                return {'status': 100, 'message': data[0][0]}

        except Exception as e:
            print(str(e))
            return {'error': str(e)}
       
        finally:
            cursor.close()
            conn.close()

class GetContestInfoForEdit(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            cursor.callproc('spGetContestInformation', _contest)
            data = cursor.fetchall()

            if (len(data) > 0):
                return jsonify({
                    'status': 200,
                    'contest': data
                })
            else:
                return jsonify({'status': 100, 'message': 'User not found'})

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()
    
class GetOngoingContestIntermediateData(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')
            parser.add_argument('can_see_all', type=bool, help='Flag to determine which submissions are retrieved')

            args = parser.parse_args()

            _contest = args['contest_id']
            _submissionsFlag = args['can_see_all']

            username = session.get('loggedUser', 'Session not found')

            if username != 'Session not found':
                cursor.callproc('spGetUserID', (username,))
                userData = cursor.fetchall()
                _userID = userData[0][0]

                if _userID:
                    global ongoing_contest_data
                    contestInfo = ongoing_contest_data[_contest]

                    standingsList = contestInfo["standings"]
                    scoresList = contestInfo["scores"]
                    submissionsList = []
                    if _submissionsFlag:
                        submissionsList = contestInfo["submissions"]
                    else:
                        for submission in contestInfo["submissions"]:
                            if submission["username"] == username:
                                submissionsList.append(submission)
                    return jsonify({'status': 200,
                                    'standingsList': standingsList,
                                    'scoresList': scoresList,
                                    'submissionsList': submissionsList
                                    })
                else:
                    return jsonify({'status': 100, 'message': 'User not found'})
            else:
                return jsonify({'status': 100, 'message': 'Session not found'})

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class AddUserstoContest(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contestID', type=str, help='List of dictionaries of problems to add')
            parser.add_argument('users', type=dict, action='append', help='List of dictionaries of problems to users')

            args = parser.parse_args()

            _contestID = args['contestID']
            _users = args['users']

            for _user in _users:
                cursor.callproc('spAddUserToContest', (_user['username'], _contestID))

            conn.commit()
            return {'StatusCode': 200}

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class AddProblemsToContest(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contestID', type=str, help='List of dictionaries of problems to add')
            parser.add_argument('problems', type=dict, action='append', help='List of dictionaries of problems to add')

            args = parser.parse_args()

            _contestID = args['contestID']
            _problems = args['problems']

            for _problem in _problems:
                cursor.callproc('spAddProblemToContest', (_contestID, _problem['problemName']))

            conn.commit()
            return {'StatusCode': 200}

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()
        
class CreateProblems(Resource):
    def __init__ (self):
        self.onlineJudgeToInt = {
            'ICPC Live Archive': 0,
            'UVa': 1,
        }

        self.onlineJudgeBaseURL = {
            'ICPC Live Archive': 'https://icpcarchive.ecs.baylor.edu/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=',
            'UVa': 'https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem='
        }

    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('problems', type=dict, action='append', help='List of dictionaries of problems to add')

            args = parser.parse_args()

            _problems = args['problems']

            for _problem in _problems:
                problemName = _problem['problemName']
                onlineJudgeProblemID = _problem['problemID']
                onlineJudge = self.onlineJudgeToInt[_problem['judge']]
                url = self.onlineJudgeBaseURL[_problem['judge']] + str(onlineJudgeProblemID)
                cursor.callproc('spCreateProblem', (onlineJudge, onlineJudgeProblemID, problemName, url))

            conn.commit()
            return {'StatusCode': 200}

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class GetContestUsers(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=str, help="Contest's numerical identifier")

            args = parser.parse_args()

            _contest = args['contest_id']

            cursor.callproc('spGetOngoingContestUsersInfo', (_contest,))
            data = []
            for row in cursor.fetchall():
                data.append({cursor.description[1][0]: row[1]})

            if len(data) > 0:
                return jsonify({'StatusCode': 200, 'users': data})
            else:
                return jsonify({'StatusCode': 100, 'Message': 'No users in contest'})

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class GetRegularUsers(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=str, help="Contest's numerical identifier")

            args = parser.parse_args()

            _contest = args['contest_id']

            _loggedUser = session.get('loggedUser')

            cursor.callproc('spGetRegularUsers', (_contest,))
            data = []
            for row in cursor.fetchall():
                if row[0] != _loggedUser:
                    data.append({cursor.description[0][0]: row[0]})

            if len(data) > 0:
                return jsonify({'StatusCode': 200, 'users': data})
            else:
                return jsonify({'StatusCode': 100, 'Message': 'No users'})

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

class DeleteContest(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()
        
        try:
            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contestID', type=int, help='Contest identifier number')

            args = parser.parse_args()
            _contestID = args['contestID']

            cursor.callproc('spDeleteContest', (_contestID,))
            data = cursor.fetchall()
            conn.commit()
            return {'status': 200, 'message': 'Contest delete succesful'}

        except Exception as e:
            try:  # empty exception handler in case rollback fails}
                conn.rollback ()
            except:
                pass

        finally:
            cursor.close()
            conn.close()

class FindCommonContest(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('usernames', action='append', help="UserIDList")

            args = parser.parse_args()

            results = []
            _users = args['usernames']
            cursor.callproc('spSelectContestUser', (_users[0],))
            data = cursor.fetchall()
            for i in range (1, len(_users)):
                results = []
                cursor.callproc('spSelectContestUser', (_users[i],))
                dataCompare = cursor.fetchall()
                for j in range(0, len(data)):
                    for i in range(0, len(dataCompare)):
                        if(data[j][0] == dataCompare[i][0]):
                            results.append(data[j])
                        
                data = results
                    
            conn.commit()
            return jsonify({'status': 200, 'contests': results})

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

#PENDING
class FindContestProblems(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('usernames', action='append', help="UserIDList")

            args = parser.parse_args()

            results = []
            _users = args['usernames']
            for user in _users:
                cursor.callproc('spUserSolvedProblems', (user,))
                data = cursor.fetchall()
                if len(data):
                    results.append(data)

            conn.commit()
            return jsonify({'status': 200, 'contests': results})

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

#PENDING
class FindContestSubmissionRatio(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('usernames',  help="UserIDList")

            args = parser.parse_args()


            print("WHATSAPP")
            _users = args['usernames']
            print(_users)
            print("DUDE")

            cursor.callproc('spCommonContest', (_users,))
            data = cursor.fetchall()
            conn.commit()
            return jsonify({'status': 200, 'contests': data})

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

#PENDING
class FindFastestSolution(Resource):
    def post(self):
        # Open MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        try:
            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('usernames', help="UserIDList")

            args = parser.parse_args()
            print("WHATSAPP")
            _users = args['usernames']
            print(_users)
            print("DUDE")

            cursor.callproc('spCommonContest', (_users,))
            data = cursor.fetchall()
            conn.commit()
            return jsonify({'status': 200, 'contests': data})

        except Exception as e:
            return {'error': str(e)}

        finally:
            cursor.close()
            conn.close()

api.add_resource(CreateUser, '/CreateUser')
api.add_resource(AuthenticateUser, '/AuthenticateUser')
api.add_resource(EditUserJudgesUsernames, '/EditUserJudgesUsernames')
api.add_resource(GetUser, '/GetUser')
api.add_resource(EditUser, '/EditUser')
api.add_resource(EditPassword, '/EditPassword')
api.add_resource(GetContestProblems, '/GetContestProblems')
api.add_resource(GetContestStandings, '/GetContestStandings')
api.add_resource(GetSubmissionsInContest, '/GetSubmissionsInContest')
api.add_resource(GetUserSubmissionsInContest, '/GetUserSubmissionsInContest')
api.add_resource(IsLoggedUserContestOwner, '/IsLoggedUserContestOwner')
api.add_resource(GetContestInfo, '/GetContestInfo')
api.add_resource(GetContestScoresPerProblem, '/GetContestScoresPerProblem')
api.add_resource(GetUserList, '/GetUserList')
api.add_resource(BanUsers, '/BanUsers')
api.add_resource(UnbanUsers, '/UnbanUsers')
api.add_resource(CreateContest, '/CreateContest')
api.add_resource(GetUserID, '/GetUserID')
api.add_resource(ViewOwnedContestList, '/ViewOwnedContestList')
api.add_resource(ViewInvitedContestList, '/ViewInvitedContestList')
api.add_resource(EditContest, '/EditContest')
api.add_resource(GetContestInfoForEdit, '/GetContestInfoForEdit')
api.add_resource(GetOngoingContestIntermediateData, '/GetOngoingContestIntermediateData')
api.add_resource(AddProblemsToContest, '/AddProblemsToContest')
api.add_resource(AddUserstoContest, '/AddUsersToContest')
api.add_resource(CreateProblems, '/CreateProblems')
api.add_resource(DeleteContest, '/DeleteContest')
api.add_resource(GetContestUsers, '/GetContestUsers')
api.add_resource(GetRegularUsers, '/GetRegularUsers')
api.add_resource(FindCommonContest, '/FindCommonContest')
api.add_resource(FindFastestSolution, '/FindFastestSolution')
api.add_resource(FindContestSubmissionRatio, '/FindContestSubmissionRatio')
api.add_resource(FindContestProblems, '/FindContestProblems')

@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/GetActiveSession')
def get():
    username = session.get('loggedUser', SESSION_NOT_FOUND)

    # Open MySQL connection
    conn = mysql.connect()
    cursor = conn.cursor()
    try:
        sql = '''SELECT usertype FROM Users WHERE username = %s'''
        data = (username,)
        cursor.execute(sql, data)
        user = cursor.fetchall()
        if len(user) > 0:
            usertype = user[0][0]
            return jsonify({'username': username, 'usertype': usertype})
        return jsonify({'error': SESSION_NOT_FOUND})

    except Exception as e:
        return jsonify({'error': str(e)})

    finally:
        cursor.close()
        conn.close()

@app.route('/SetActiveSession')
def set():
    session['loggedUser'] = 'username'
    return 'done'

@app.route('/Logout')
def logout():
    session.pop('loggedUser', None)
    return 'You were logged out'

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
