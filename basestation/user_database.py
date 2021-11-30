import bcrypt
import datetime
import hashlib
import os
import json
from basestation import db


class Program(db.Model):
    __tablename__ = 'program'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, nullable=False)
    time = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String, nullable=False)
    duration = db.Column(db.String, nullable=False)

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
        return{
            'id': self.id,
            'email': self.email,
            'custom_function': self.custom_function
        }


class Chatbot(db.Model):
    __tablename__ = 'chatbot'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    context = db.Column(db.String, nullable=False)

    def __init__ (self, user_id: int, context: str):
        self.user_id = user_id
        self.context = context

    def add_context(self, new_context: str):
        self.context += new_context
        
    def clear_context(self):
        # set the context to empty string
        self.context = ""
    
    def serialize(self) -> dict:
        return{
            'id': self.user_id,
            'context': self.context
        }