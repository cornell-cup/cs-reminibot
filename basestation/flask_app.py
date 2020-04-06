import time
import json
from flask import Flask, request, redirect
from flask_db import db, Program, User
from flask_api import status
from flask_cors import CORS

app = Flask(__name__)
db_filename = 'program.db'
CORS(app)  # allows cross-origin-requests

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s' % db_filename
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

db.init_app(app)
with app.app_context():
    db.create_all()

login_email = ""


def get_user_by_email(email):
    return User.query.filter(User.email == email).first()


def get_user_by_session_token(session_token):
    return User.query.filter(User.session_token == session_token).first()


def get_user_by_update_token(update_token):
    return User.query.filter(User.update_token == update_token).first()

def update_custom_function_by_session_token(session_token, custom_function):
    user = get_user_by_session_token(session_token)
    if not user:
        return False, "Invalid session token"
    user.custom_function = custom_function
    db.session.commit()
    return True, user


def verify_credentials(email, password):
    optional_user = get_user_by_email(email)

    if optional_user is None:
        return False, None

    return optional_user.verify_password(password), optional_user


def create_user(email, password):
    already_exisiting_user = get_user_by_email(email)

    if already_exisiting_user:
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
    global login_email
    print("login_in email: " + login_email)
    data = request.get_json()
    t = time.localtime()
    current_time = time.strftime("%H:%M:%S", t)
    print(data)
    print(current_time)
    print(login_email)
    program = Program(
        code=data.get('value'),
        time=current_time,
        email=login_email
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
        return json.dumps({'error': 'Invalid email or password'}), 404

    created, user = create_user(email, password)

    if not created:
        print("error: User already exists")
        return json.dumps({'error': 'User already exists'}), 404

    print("session_token: " + user.session_token)
    print("session_expiration" + str(user.session_expiration))
    print("update_token" + user.update_token)
    print("user_id" + str(user.id))

    return json.dumps({
        'session_token': user.session_token,
        'session_expiration': str(user.session_expiration),
        'update_token': user.update_token,
        'user_id': user.id,
        'email': email
    })


@app.route('/test/', methods=['POST'])
def test():
    return "hi"


@app.route('/login/', methods=['POST'])
def login():
    global login_email
    email = request.form['email']
    password = request.form['password']

    if email is None or password is None:
        print("fail1")
        return json.dumps({'error': 'Invalid email or password'}), 404

    print("Reached Here!")
    success, user = verify_credentials(email, password)

    if not success:
        print("fail2")
        return json.dumps({'error': 'Incorrect email or password'}), 404

    print("success" + email)
    login_email = email
    return json.dumps({
        'session_token': user.session_token,
        'session_expiration': str(user.session_expiration),
        'update_token': user.update_token,
        'user_id': user.id,
        'email': email,
        'custom_function': user.custom_function
    })


@app.route('/logout/', methods=['POST'])
def logout():
    global login_email
    if login_email == "":
        print("login email empty")
        content = {'error': 'no user to logout'}
        return content, status.HTTP_400_BAD_REQUEST

    content = {'success': 'user '+login_email+' was logged out.'}
    login_email = ""
    return content, status.HTTP_200_OK


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

@app.route('/custom_function/', methods=['POST'])
def update_custom_function():
    session_token = request.form['session_token']
    custom_function = request.form['custom_function']

    if not session_token or not custom_function:
        print("error: Missing session_token or custom_function")
        return json.dumps({'error': 'Missing session_token or custom_function'}), 404

    success, res = update_custom_function_by_session_token(session_token, custom_function)

    if not success:
        print("error: invalid session_token")
        return json.dumps({'error': 'invalid session_token'}), 404
    return json.dumps({'custom_function': custom_function}), 201

if __name__ == "__main__":
    app.run()
