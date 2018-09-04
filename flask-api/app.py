from flask import Flask, jsonify
from flaskext.mysql import MySQL
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
mysql = MySQL()

# CORS configurations
app.config['CORS_HEADERS'] = 'Content-Type'

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'root'
app.config['MYSQL_DATABASE_DB'] = 'retoactua'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'

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
    cur.execute('SELECT * FROM users WHERE id = ' + id)
    r = [dict((cur.description[i][0], value)
              for i, value in enumerate(row)) for row in cur.fetchall()]
    return jsonify({'Users' : r})

if __name__ == '__main__':
    app.run(debug=True)