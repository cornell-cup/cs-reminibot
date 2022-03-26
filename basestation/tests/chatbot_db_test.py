""" Test file for chatbot database functionality.

*** IMPORTANT ***
The test will not pass when run repeatedly unless these two lines in 
basestation/__init__.py are COMMENTED OUT
and these same two lines are 
UNCOMMENTED in basestation/databases/__init__.py

THE TWO LINES:
# db_filename = 'program.db'
# app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_filename}'  

******************

HOW TO RUN:
COMMAND: python chatbot_db_test.py
"""

import sys
import os
sys.path.append('../../')
import json
import pytest
from flask import Flask
from basestation import create_app


@pytest.fixture(scope="module")
def app():
    """ Test version of __init__.py for the flask server
    """
    print("creating app")
    app = create_app()
    app.config.update({
    "TESTING": True,
    })

    # other setup can go here

    yield app

    # clean up / reset resources here

    # from basestation.user_database import Program, User


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()


def test_ping(client):
    """ Ensure flask app is set up properly.
    """
    resp = client.get('/ping')
    data = json.loads(resp.data.decode())
    assert resp.status_code == 200
    assert 'pong' in data['message']
    assert 'success' in data['status']


def test_add_user(client):
    """ Ensure a new user can be added to the database.
    """
   
    response = client.post(
        '/register',
        data={
            "email":"michael",
            "password":"test123"
        }
    )
    data = json.loads(response.data.decode())
    print(response)
    assert response.status_code == 200


def test_add_local_context(client):
    """ Test that adding context locally works.
    """
    # change local context
    response = client.post(
        '/chatbot-context',
        data = json.dumps(dict(
            command = 'update',
            context = "the sky is green."
        )),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200


def test_get_local_context(client):
    """ Test local context was updated.
    """
    response = client.post(
        '/chatbot-context',
        data = json.dumps(dict(
        command = 'get-all-local-context',
        )),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    returned_context = data['context']
    assert response.status_code == 200
    assert "the sky is green" in ' '.join(returned_context).lower()
    assert "the sky is blue" in ' '.join(returned_context).lower()


def test_commit_local_context(client):
    """ Test commiting context to database.
    """
    response = client.post(
        '/chatbot-context',
        data = json.dumps(dict(command = 'commit-to-db')),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    
    
def test_get_db_context(client):
    """ Test fetch context from database.
    """
    response = client.post(
        '/chatbot-context',
        data = json.dumps(dict(command = 'get-all-db-context')),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    returned_context = data['context']
    assert response.status_code == 200
    assert "the sky is green" in (returned_context).lower()
    assert "the sky is blue" in (returned_context).lower()

# TODO corner cases:
# log in without registering
# add/get context without logging in


if __name__ == "__main__":
    # pytest.main(["-s", "."])
    pytest.main([])
