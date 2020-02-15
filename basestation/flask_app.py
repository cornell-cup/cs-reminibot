import time
import json
from flask import Flask, request, redirect
from flask_db import db, Program, User

app = Flask(__name__)
db_filename = 'program.db'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s' % db_filename
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

db.init_app(app)
with app.app_context():
    db.create_all()

login_yet = False
login_email = ""


def get_user_by_email(email):
    return User.query.filter(User.email == email).first()


def get_user_by_session_token(session_token):
    return User.query.filter(User.session_token == session_token).first()


def get_user_by_update_token(update_token):
    return User.query.filter(User.update_token == update_token).first()


def verify_credentials(email, password):
    optional_user = get_user_by_email(email)

    if optional_user is None:
        return False, None

    return optional_user.verify_password(password), optional_user


def create_user(email, password):
    optional_user = get_user_by_email(email)

    if optional_user is not None:
        return False, optional_user

    user = User(
        email=email,
        password=password
    )

    db.session.add(user)
    db.session.commit()
    return True, user


def renew_session(update_token):
    user = get_user_by_update_token(update_token)
    print(user)
    if user is None:
        raise Exception('Invalid update token')

    user.renew_session()
    db.session.commit()
    return user


def extract_token(request):
    auth_header = request.headers.get('Authorization')
    if auth_header is None:
        return False, json.dumps({'error': 'Missing authorization header.'})

    bearer_token = auth_header.replace('Bearer ', '').strip()
    if not bearer_token:
        return False, json.dumps({'error': 'Invalid authorization header.'})

    return True, bearer_token


@app.route("/")
def hello():
    return "Hello World!"


@app.route("/program/")
def get_program():
    programs = Program.query.all()
    for program in programs:
        print(program.serialize())
    return json.dumps({'data': [program.serialize() for program in programs]})


@app.route("/code/", methods=['POST'])
def post_code():
    print("can you see me")
    print(login_email)
    data = request.get_json()
    t = time.localtime()
    current_time = time.strftime("%H:%M:%S", t)
    print(data)
    print(current_time)
    program = Program(
        code=data.get('value'),
        time=current_time
    )
    db.session.add(program)
    db.session.commit()
    return json.dumps(data)


@app.route('/register/', methods=['POST'])
def register_account():
    email = request.form['email']
    password = request.form['password']

    if email is None or password is None:
        print("error: Invalid email or password")
        return redirect("http://localhost:8080/start")

    created, user = create_user(email, password)

    if not created:
        print("error: User already exists")
        return redirect("http://localhost:8080/start")

    print("session_token: " + user.session_token)
    print("session_expiration" + str(user.session_expiration))
    print("update_token" + user.update_token)
    print("user_id" + str(user.id))

    return redirect("http://localhost:8080/start")


@app.route('/login/', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    if email is None or password is None:
        print("error: Invalid email or password")
        return redirect("http://localhost:8080/start")

    success, user = verify_credentials(email, password)

    if not success:
        print("error: Incorrect email or password'")
        return redirect("http://localhost:8080/start")

    login_yet = True
    login_email = email
    print("session_token: " + user.session_token)
    print("session_expiration" + str(user.session_expiration))
    print("update_token" + user.update_token)
    print("user_id" + str(user.id))

    return redirect("http://localhost:8080/start")


@app.route('/session/', methods=['POST'])
def update_session():
    success, update_token = extract_token(request)

    if not success:
        return update_token

    try:
        user = renew_session(update_token)
    except:
        return json.dumps({'error': 'Invalid update token'})

    return json.dumps({
        'session_token': user.session_token,
        'session_expiration': str(user.session_expiration),
        'update_token': user.update_token
    })


if __name__ == "__main__":
    app.run()
