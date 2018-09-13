import os
from flask import Flask, jsonify
from flaskext.mysql import MySQL
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
cors = CORS(app)
mysql = MySQL()

# CORS configurations
app.config['CORS_HEADERS'] = 'Content-Type'

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = os.getenv('MYSQL_DATABASE_USER')
app.config['MYSQL_DATABASE_PASSWORD'] = os.getenv('MYSQL_DATABASE_PASSWORD')
app.config['MYSQL_DATABASE_DB'] = os.getenv('MYSQL_DATABASE_DB')
app.config['MYSQL_DATABASE_HOST'] = os.getenv('MYSQL_DATABASE_HOST')
app.config['MYSQL_DATABASE_PORT'] = 3307

mysql.init_app(app)

@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/users')
def get_users():
    if False:
        return jsonify({'Users': [{'error': 'ACCESS DENIED'}]})
    cur = mysql.connect().cursor()
    cur.execute('SELECT * FROM users')
    r = [dict((cur.description[i][0], value)
              for i, value in enumerate(row)) for row in cur.fetchall()]
    return jsonify({'Users' : r})

@app.route('/users/<id>')
def get_user(id):
    if False:
        return jsonify({'Users': [{'error': 'ACCESS DENIED'}]})
    cur = mysql.connect().cursor()
    cur.execute("SELECT * FROM users WHERE username = '" + id + "'")
    r = [dict((cur.description[i][0], value)
              for i, value in enumerate(row)) for row in cur.fetchall()]
    return jsonify({'Users' : r})

if __name__ == '__main__':
    app.run(debug=True)