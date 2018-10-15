import os
import bcrypt
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
conn = mysql.connect()
cursor = conn.cursor()

class CreateUser(Resource):
    def post(self):
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

class AuthenticateUser(Resource):
    def post(self):
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

class EditUser(Resource):
    def post(self):
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

class EditUserJudgesUsernames(Resource):
    def post(self):
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

class GetUser(Resource):
    def post(self):
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

class EditPassword(Resource):
    def post(self):
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
                return {'status':100,'message':'Incorrect password'}
        except Exception as e:
            raise e

class GetUserList(Resource):
    def post(self):
        try:
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
            return jsonify({'status': 'SUCCESS',
                            'userList': r})

        except Exception as e:
            raise e

class BanUsers(Resource):
    def post(self):
        try:
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
            return jsonify({'status': 'SUCCESS'})
        except Exception as e:
            raise e

class UnbanUsers(Resource):
    def post(self):
        try:
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

api.add_resource(CreateUser, '/CreateUser')
api.add_resource(AuthenticateUser, '/AuthenticateUser')
api.add_resource(EditUserJudgesUsernames, '/EditUserJudgesUsernames')
api.add_resource(GetUser, '/GetUser')
api.add_resource(EditUser, '/EditUser')
api.add_resource(EditPassword, '/EditPassword')
api.add_resource(GetUserList, '/GetUserList')
api.add_resource(BanUsers, '/BanUsers')
api.add_resource(UnbanUsers, '/UnbanUsers')

@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/GetActiveSession')
def get():
    username = session.get('loggedUser', SESSION_NOT_FOUND)
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
