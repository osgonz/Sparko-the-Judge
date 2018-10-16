import os
import bcrypt
import datetime
from flask import Flask, jsonify, session
from flaskext.mysql import MySQL
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api, reqparse
from dotenv import load_dotenv

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


# Session configurations
app.config['SECRET_KEY'] = 'My secret placeholder string'

mysql.init_app(app)

class CreateUser(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
                cursor.close()
                conn.close()
                return {'StatusCode':'200','Message': 'User creation success'}
            else:
                cursor.close()
                conn.close()
                return {'StatusCode':'1000','Message': data[0][0]}

        except Exception as e:
            cursor.close()
            conn.close()
            return {'error': str(e)}

class AuthenticateUser(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
                    cursor.close()
                    conn.close()
                    return {'status':200,'UserId':str(user_id),'userType':user_type}
                else:
                    cursor.close()
                    conn.close()
                    return {'status':100,'message':'Authentication failure'}

            return {'status':100,'message':'Authentication failure'}
        except Exception as e:
            cursor.close()
            conn.close()
            return {'error': str(e)}

class EditUser(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
                cursor.close()
                conn.close()
                return {'status': 200, 'message': 'User edit succesful'}
            else:
                cursor.close()
                conn.close()
                return {'status': 100, 'message': data[0][0]}
        except Exception as e:
            cursor.close()
            conn.close()
            return {'error': str(e)}

class EditUserJudgesUsernames(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
                cursor.close()
                conn.close()
                return {'status': 200, 'message': 'Online judges edit succesful'}
            else:
                cursor.close()
                conn.close()
                return {'status': 100, 'message': data[0][0]}
        except Exception as e:
            cursor.close()
            conn.close()
            return {'error': str(e)}

class GetUser(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
                cursor.close()
                conn.close()
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
                cursor.close()
                conn.close()
                return {'status': 100, 'message': 'User not found'}
        except Exception as e:
            cursor.close()
            conn.close()
            return {'error': str(e)}

class EditPassword(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
                    cursor.close()
                    conn.close()
                    return {'status': 200, 'message': 'Password edit succesful'}
                else:
                    cursor.close()
                    conn.close()
                    return {'status': 100, 'message': data[0][0]}
            else:
                cursor.close()
                conn.close()
                return {'status': 100, 'message': 'Incorrect password'}
        except Exception as e:
            cursor.close()
            conn.close()
            raise e

class IsLoggedUserContestOwner(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
                cursor.close()
                conn.close()
                return jsonify({'status': 200})
            else:
                cursor.close()
                conn.close()
                return jsonify({'status': 100, 'message': 'User not owner'})
            _
        except Exception as e:
            raise e

class GetContestInfo(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
                        cursor.close()
                        conn.close()
                        return jsonify({'status': 200,
                                        'contestInfo': data[0],
                                        'isParticipant': len(validData) > 0})
                    else:
                        cursor.close()
                        conn.close()
                        return jsonify ({'status': 100, 'message': 'Contest not found'})
                else:
                    cursor.close()
                    conn.close()
                    return jsonify ({'status': 100, 'message': 'User not found'})
            else:
                cursor.close()
                conn.close()
                return jsonify({'status': 100, 'message': 'Session not found'})
            _
        except Exception as e:
            raise e

class GetContestProblems(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            cursor.callproc('spGetContestProblems', (_contest,))
            data = [dict((cursor.description[i][0], value)
                        for i, value in enumerate(row)) for row in cursor.fetchall()]
            cursor.close()
            conn.close()
            return jsonify({'status': 200,
                            'problemList': data})
            _
        except Exception as e:
            cursor.close()
            conn.close()
            raise e

class GetContestStandings(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            cursor.callproc('spGetContestStandings', (_contest,))
            data = [dict((cursor.description[i][0], value)
                        for i, value in enumerate(row)) for row in cursor.fetchall()]
            cursor.close()
            conn.close()
            return jsonify({'status': 200,
                            'standingsList': data})
            _
        except Exception as e:
            cursor.close()
            conn.close()
            raise e

class GetSubmissionsInContest(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            cursor.callproc('spGetSubmissionsInContest', (_contest,))
            data = [dict((cursor.description[i][0], value)
                        for i, value in enumerate(row)) for row in cursor.fetchall()]
            cursor.close()
            conn.close()
            return jsonify({'status': 200,
                            'submissionsList': data})
            _
        except Exception as e:
            cursor.close()
            conn.close()
            raise e

class GetUserSubmissionsInContest(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
                    cursor.close()
                    conn.close()
                    return jsonify({'status': 200,
                                    'userSubmissionsList': data})
                else:
                    cursor.close()
                    conn.close()
                    return jsonify({'status': 100, 'message': 'User not found'})
            else:
                cursor.close()
                conn.close()
                return jsonify({'status': 100, 'message': 'Session not found'})
            _
        except Exception as e:
            cursor.close()
            conn.close()
            raise e

class GetContestScoresPerProblem(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')
            parser.add_argument('problem_id_list', type=list, help='List of problem identifier numbers', action='append')

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

            cursor.close()
            conn.close()
            return jsonify({'status': 200, 'scoreList': solutionList})
        except Exception as e:
            cursor.close()
            conn.close()
            raise e

class GetUserList(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('usertype', type=str, help='User type')

            args = parser.parse_args()

            _username = session.get('loggedUser', SESSION_NOT_FOUND)
            _usertype = args['usertype']

            if _usertype == '0':
                sql = '''SELECT userID AS id, username, CONCAT(fname, " ",lname) AS fullName, usertype AS userType, iduva AS uvaUsername, idicpc AS icpcUsername 
                        FROM users WHERE usertype != %s AND username != %s'''
                data = (_usertype,_username)
            else:
                sql = '''SELECT userID AS id, username, CONCAT(fname, " ",lname) AS fullName, usertype AS userType, iduva AS uvaUsername, idicpc AS icpcUsername 
                        FROM users
                        WHERE usertype = %s AND username != %s '''
                data = (_usertype, _username)

            cursor.execute(sql, data)

            r = [dict((cursor.description[i][0], value)
                    for i, value in enumerate(row)) for row in cursor.fetchall()]
            cursor.close()
            conn.close()
            return jsonify({'status': 'SUCCESS',
                            'userList': r})

        except Exception as e:
            cursor.close()
            conn.close()
            raise e

class BanUsers(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('usernames', action='append', help='Users to ban')
            args = parser.parse_args()

            _usersBanned = args['usernames']

            sql = '''UPDATE users
                    SET usertype = 2
                    WHERE userID = %s'''
            for userID in _usersBanned:
                data = (userID, )
                cursor.execute(sql, data)

            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'status': 'SUCCESS'})
        except Exception as e:
            cursor.close()
            conn.close()
            raise e

class UnbanUsers(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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
            cursor.close()
            conn.close()
            return jsonify({'status': 'SUCCESS'})
        except Exception as e:
            cursor.close()
            conn.close()
            raise e

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

class CreateContest(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

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

            cursor.callproc('spCreateContest',(_contestName,_contestDescription, _contestStartDate, _contestEndDate, _contestStatus, _contestOwnerUsername))
            data = cursor.fetchall()

            if len(data) is 0:
                conn.commit()
                cursor.close()
                conn.close()
                return {'StatusCode':200,'Message': 'Contest creation success'}
            else:
                cursor.close()
                conn.close()
                return {'StatusCode':1000,'Message': str(data[0])}
        except Exception as e:
            cursor.close()
            conn.close()
            return {'error': str(e)}

api.add_resource(CreateContest, '/CreateContest')

class GetUserID(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('email', type=str, help='email to find userID')

            args = parser.parse_args()

            _email = args['email']

            cursor.callproc('spUserID', (_email,))
            data = cursor.fetchall()

            if len(data) > 0:
                cursor.close()
                conn.close()
                return {'StatusCode':'200','Message': 'UserID found'}
            else:
                cursor.close()
                conn.close()
                return {'StatusCode':'1000','Message': str(data[0])}

        except Exception as e:
            cursor.close()
            conn.close()
            return {'error': str(e)}

api.add_resource(GetUserID, '/GetUserID')

class ViewOwnedContestList(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Owner username')

            args = parser.parse_args()

            _ownerUsername = args['username']

            cursor.callproc('spGetOwnedContests', (_ownerUsername,))
            data = [dict((cursor.description[i][0], value)
                         for i, value in enumerate(row)) for row in cursor.fetchall()]

            if len(data) >= 0:
                cursor.close()
                conn.close()
                return jsonify({'StatusCode': 200,'ownedContestList': data})
            else:
                cursor.close()
                conn.close()
                return jsonify({'StatusCode': 1000,'Message': 'No owned contests'})

        except Exception as e:
            cursor.close()
            conn.close()
            print(str(e))
            return {'error': str(e)}

api.add_resource(ViewOwnedContestList, '/ViewOwnedContestList')

class ViewInvitedContestList(Resource):
    def post(self):
        try:
            # Opem MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse the arguments
            parser = reqparse.RequestParser()
            parser.add_argument('username', type=str, help='Current username')

            args = parser.parse_args()

            _username = args['username']

            cursor.callproc('spGetInvitedContests', (_username,))
            data = [dict((cursor.description[i][0], value)
                         for i, value in enumerate(row)) for row in cursor.fetchall()]

            if len(data) >= 0:
                cursor.close()
                conn.close()
                return jsonify({'StatusCode': 200,'invitedContestList': data})
            else:
                cursor.close()
                conn.close()
                return jsonify({'StatusCode': 1000,'Message': 'No owned contests'})
        except Exception as e:
            cursor.close()
            conn.close()
            print(str(e))
            return {'error': str(e)}

api.add_resource(ViewInvitedContestList, '/ViewInvitedContestList')

class EditContest(Resource):
    def post(self):
        try:
            # Open MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('ownerID', type=int, help='ownerID')
            parser.add_argument('ContestName', type=str, help='Contest Name')
            parser.add_argument('description', type=str, help='Description')
            parser.add_argument('startDate', type=datetime.datetime, help='startDate')
            parser.add_argument('endDate', type=datetime.datetime, help='endDate')
            parser.add_argument('status', type=int, help='status')

            args = parser.parse_args()

            _ownerID = args['ownerID']
            _contestName = args['ContestName']
            _description = args['description']
            _startDate = args['startDate']
            _endDate = args['endDate']
            _status = args['status']

            cursor.callproc('spEditContest', (_ownerID, _contestName, _description, _startDate, _endDate, _status))
            data = cursor.fetchall()

            if(len(data) == 0):
                conn.commit()
                cursor.close()
                conn.close()
                return {'status': 200, 'message': 'Contest edit succesful'}
            else:
                cursor.close()
                conn.close()
                return {'status': 100, 'message': data[0][0]}
        except Exception as e:
            cursor.close()
            conn.close()
            return {'error': str(e)}

api.add_resource(EditContest, '/EditContest')

class GetContestInfoForEdit(Resource):
   def post(self):
        try:
            # Open MySQL connection
            conn = mysql.connect()
            cursor = conn.cursor()

            # Parse request arguments
            parser = reqparse.RequestParser()
            parser.add_argument('contest_id', type=int, help='Contest identifier number')

            args = parser.parse_args()

            _contest = args['contest_id']

            cursor.callproc('spGetContestInformation', _contest)
            data = cursor.fetchall()

            if(len(data) > 0):
                cursor.close()
                conn.close()
                return jsonify({
                    'status': 200,
                    'contest': data
                })
            else:
                cursor.close()
                conn.close()
                return jsonify({'status': 100, 'message': 'User not found'})
        except Exception as e:
            cursor.close()
            conn.close()
            return {'error': str(e)}

api.add_resource(GetContestInfoForEdit, '/GetContestInfoForEdit')

@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/GetActiveSession')
def get():
    username = session.get('loggedUser', SESSION_NOT_FOUND)
    try:
        # Opem MySQL connection
        conn = mysql.connect()
        cursor = conn.cursor()

        sql = '''SELECT usertype FROM Users WHERE username = %s'''
        data = (username,)
        cursor.execute(sql, data)
        user = cursor.fetchall()
        if len(user) > 0:
            usertype = user[0][0]
            cursor.close()
            conn.close()
            return jsonify({'username': username, 'usertype': usertype})
        cursor.close()
        conn.close()
        return jsonify({'error': SESSION_NOT_FOUND})
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({'error': str(e)})
    #return username

@app.route('/SetActiveSession')
def set():
    session['loggedUser'] = 'username'
    return 'done'

@app.route('/Logout')
def logout():
    session.pop('loggedUser', None)
    return 'You were logged out'

if __name__ == '__main__':
    app.run(debug=True)
