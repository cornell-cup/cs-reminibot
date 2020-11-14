from flask_sqlalchemy import SQLAlchemy
import bcrypt
import datetime
import hashlib
import os
import json


db = SQLAlchemy()


class Program(db.Model):
    __tablename__ = 'program'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, nullable=False)
    time = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String, nullable=False)
    duration = db.Column(db.String, nullable=False)

    def __init__(self, **kwargs):
        self.code = kwargs.get('code', '')
        self.time = kwargs.get('time', '')
        self.email = kwargs.get('email', '')
        self.duration = kwargs.get("duration", '')

    def serialize(self):
        return {
            'id': self.id,
            'code': self.code,
            'time': self.time,
            'email': self.email,
            'duration': self.duration
        }


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)

    # User information
    email = db.Column(db.String, nullable=False, unique=True)
    password_digest = db.Column(db.String, nullable=False)

    # Custom Functions
    custom_function = db.Column(db.String, nullable=False)

    # Session information
    session_token = db.Column(db.String, nullable=False, unique=True)
    session_expiration = db.Column(db.DateTime, nullable=False)
    update_token = db.Column(db.String, nullable=False, unique=True)

    def __init__(self, **kwargs):
        self.email = kwargs.get('email')
        self.password_digest = bcrypt.hashpw(str(kwargs.get('password')).encode('utf8'),
                                             bcrypt.gensalt(rounds=13))
        self.custom_function = "[]"
        self.renew_session()

    # Used to randomly generate session/update tokens
    def _urlsafe_base_64(self):
        return hashlib.sha1(os.urandom(64)).hexdigest()

    # Generates new tokens, and resets expiration time
    def renew_session(self):
        self.session_token = self._urlsafe_base_64()
        self.session_expiration = datetime.datetime.now() + \
            datetime.timedelta(days=1)
        self.update_token = self._urlsafe_base_64()

    def verify_password(self, password):
        return bcrypt.checkpw(str(password).encode('utf8'),
                              self.password_digest)

    # Checks if session token is valid and hasn't expired
    def verify_session_token(self, session_token):
        return session_token == self.session_token and \
            datetime.datetime.now() < self.session_expiration

    def verify_update_token(self, update_token):
        return update_token == self.update_token

    def serialize(self):
        return{
            'id': self.id,
            'email': self.email,
            'custom_function': self.custom_function
        }


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
    already_existing_user = get_user_by_email(email)

    if already_existing_user:
        return False, already_existing_user

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
