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
from basestation.user_database import Program, User, Chatbot as ChatbotTable
from basestation.base_station import BaseStation



@pytest.fixture(scope="module")
def app():
    """ Test version of __init__.py for the flask server
    """
    print("creating app")
    app = Flask(
        __name__, template_folder='../static/gui/', static_folder='../static/gui/static'
    )
    # create a dummy db so we don't modify the actual db
    db = SQLAlchemy()
    db_filename = 'db_test.db'

    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_filename}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = True

    db.init_app(app)

    with app.app_context():
        # alternative pattern to app.app_context().push()
        # all commands indented under 'with' are run in the app context
        db.create_all()
        yield app
        db.session.close()
        db.drop_all()

    return app

    # from basestation.user_database import Program, User


# dont know what is going on below here

def test_test(app):
    print("test")
    with app.test_client() as client:
        response = client.post(
            '/register',
            data=json.dumps(dict(
                email='michael@realpython.com',
                password='test123'
            )),
            content_type='application/json',
        )
        data = json.loads(response.data.decode())
        assert response.status_code == 200
        # assert 'michael@realpython.com was added!' in data['message']
        assert 'success' in data['status']
    # BaseStation.register('user', 'pass')


def add_context_entry(app):
    BaseStation.update_chatbot_context_db(id, 'context')

    # make a user
    # check that the entries are empty
    # commit 1 entry
    # try to get it, make sure it's correct
    # commit 2nd entry
    # check it
    # clear entry
    # check
    #

if __name__=="__main__":
    pytest.main([])