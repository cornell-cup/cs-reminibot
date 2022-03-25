# import bs
# Minibot imports.
import sys
import os
sys.path.append('../../')
import json
import pytest
import unittest
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from basestation.base_station import BaseStation



@pytest.fixture(scope="module")
def app():
    """ Test version of __init__.py for the flask server
    """
    print("creating app")
    app = Flask(
        __name__, template_folder='../../static/gui/', static_folder='../../static/gui/static'
    )
    # create a dummy db so we don't modify the actual db
    db = SQLAlchemy()
    db_filename = 'db_test.db'

    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_filename}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = True

    db.init_app(app)

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
                bcrypt.hashpw(password.encode('utf8'),
                              bcrypt.gensalt(rounds=13))
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

        def __init__(self, user_id: int, context: str):
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

    with app.app_context():
        # alternative pattern to app.app_context().push()
        # all commands indented under 'with' are run in the app context
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


    return app

    # from basestation.user_database import Program, User

@pytest.fixture(scope = "module")
def base_station(app):
    return BaseStation(app.debug)


# dont know what is going on below here

def test_add_user(app, base_station):
    print("test 1")

    assert base_station.register('user', 'pass') == 1


# def test_get_user(app, base_station):
#     print("test 2")
#     assert base_station.login('user', 'pass')[0] == 1
#     assert base_station.login('user', 'wrongpass')[0] == 0


# def test_add_context_entry(app, base_station):
#     print("test 3")
#     id = base_station.get_user_id_by_email('user')
#     print(id)
#     base_station.update_chatbot_context_db(str(id), 'this is context')
#     data = base_station.chatbot_get_context(str(id))

#     assert data["context"] == 'this is context'


# make a user
# check that the entries are empty
# commit 1 entry
# try to get it, make sure it's correct
# commit 2nd entry
# check it
# clear entry
# check
#


if __name__ == "__main__":
    # pytest.main(["-s", "."])
    pytest.main([])
