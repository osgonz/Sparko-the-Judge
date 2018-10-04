import os
import bcrypt
from flask import Flask, jsonify, session
from flaskext.mysql import MySQL
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api, reqparse
from dotenv import load_dotenv

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

api.add_resource(CreateUser, '/CreateUser')

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
                    session['loggedUser'] = _userName
                    return {'status':200,'UserId':str(user_id)}
                else:
                    return {'status':100,'message':'Authentication failure'}

        except Exception as e:
            return {'error': str(e)}

api.add_resource(AuthenticateUser, '/AuthenticateUser')

@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/GetActiveSession')
def get():
    return session.get('loggedUser', 'Session not found')

@app.route('/SetActiveSession')
def set():
    session['loggedUser'] = 'username'
    return 'done'

@app.route('/Logout')
def logout():
    session.pop('loggedUser', None)
    return 'You were logged out'

@app.route('/GetUserList/<userType>')
def getUserList(userType):
    if userType == '0':
        sql = '''SELECT userID AS id, username, CONCAT(fname, " ",lname) AS fullName, usertype AS userType, iduva AS uvaUsername, idicpc AS icpcUsername 
                FROM users'''
    else:
        sql = '''SELECT userID AS id, username, CONCAT(fname, " ",lname) AS fullName, usertype AS userType, iduva AS uvaUsername, idicpc AS icpcUsername 
                FROM users
                WHERE usertype = 1'''

    cursor.execute(sql)
    
    r = [dict((cursor.description[i][0], value)
            for i, value in enumerate(row)) for row in cursor.fetchall()]
    return jsonify({'status': 'SUCCESS',
                    'userList': r})

@app.route('/BanUser/<bannedUser>')
def banUser(bannedUser):
    sql = '''UPDATE users
            SET users.usertype = 2
            WHERE users.userID = %s''' % (bannedUser)
    
    cursor.execute(sql)
    conn.commit()
    return bannedUser



if __name__ == '__main__':
    app.run(debug=True)



