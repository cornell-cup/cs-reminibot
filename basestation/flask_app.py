import json
from flask import Flask, request
from flask_db import db, Program

app = Flask(__name__)
db_filename = 'program.db'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s' % db_filename
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

db.init_app(app)
with app.app_context():
    db.create_all()

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/program/")
def get_program():
    programs = Program.query.all()
    for program in programs:
        print(program.serialize())
    return json.dumps({'data': program.serialize() for program in programs})

@app.route("/code/", methods=['POST'])
def post_code():
    # data = request.get_json(silent=True)
    # print(data)
    # return data
    # value = {'key': data.get('key'), 'value': data.get(
    #     'value'), 'bot_name': data.get('bot_name')}
    # return json.dumps(value)
    data = request.get_json()
    print(data)
    program = Program(
        code = data.get('value')
    )
    db.session.add(program)
    db.session.commit()
    return json.dumps(data)


if __name__ == "__main__":
    app.run()
