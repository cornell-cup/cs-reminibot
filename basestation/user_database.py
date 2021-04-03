import bcrypt
import datetime
import hashlib
import os
import json
from basestation import db


class Submission(db.Model):
    __tablename__ = 'submission'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, nullable=False)
    time = db.Column(db.String, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    result = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    
    def __init__(self, code, time, duration, user_id, result='Not completed'):
        self.code = code
        self.time = time
        self.duration = duration
        self.result = result
        self.user_id = user_id


    def serialize(self):
        return {
            'id': self.id,
            'code': self.code,
            'time': self.time,
            'duration': self.duration,
            'result': self.result,
            'user_id': self.user_id
        }


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)

    """User information"""
    email = db.Column(db.String, nullable=False, unique=True)
    # Never store a password directly in a database, store a weird hash
    # of the password so that a hacker cannot directly see the user passwords
    # by somehow accessing the database
    # Read the Section: "Storing Passwords" in Fred Schneider's notes:
    # https://www.cs.cornell.edu/courses/cs5430/2020fa/chptr.humAuth.pdf
    password_digest = db.Column(db.String, nullable=False)

    # Custom Functions
    custom_function = db.Column(db.String, nullable=False)

    submissions = db.relationship('Submission')

    def __init__(self, email: str, password: str):
        self.email = email
        self.password_digest = (
            bcrypt.hashpw(password.encode('utf8'), bcrypt.gensalt(rounds=13))
        )
        self.custom_function = "[]"

    def verify_password(self, password: str) -> bool:
        """Checks the password against its hash that is stored in the database"""
        return bcrypt.checkpw(password.encode('utf8'), self.password_digest)

    def serialize(self) -> dict:
        return {
            'id': self.id,
            'email': self.email,
            'custom_function': self.custom_function,
            'submissions': [submission.serialize() for submission in self.submissions]
        }
