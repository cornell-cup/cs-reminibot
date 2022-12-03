""" Test file for chatbot database functionality.

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
    app = create_app(test_config = True)
    app.config.update({
    "TESTING": True,
    })
    yield app



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
            "email":"michael@michael.michael",
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


def test_clear_local_context(client):
    # send the clear command
    response = client.post(
        '/chatbot-context',
        data = json.dumps(dict(command = 'reset-context-stack')),
        content_type='application/json'
    )
    # make sure local context is clear now
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
    assert "the sky is green" not in ' '.join(returned_context).lower()


def test_get_db_guest(client):
    """ Test fetch context from database if the user is not logged in. 
    """
    # logout
    response = client.post(
        '/logout/'
    )
    # get from database
    response = client.post(
        '/chatbot-context',
        data = json.dumps(dict(command = 'get-all-db-context')),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    # returned_context = data['context']
    assert response.status_code != 200
    # assert "the sky is green" not in (returned_context).lower()
    # assert "the sky is blue" in (returned_context).lower()
    

def test_commit_db_guest(client):
    """try to commit to database if not logged in"""

    response = client.post(
        '/chatbot-context',
        data = json.dumps(dict(command = 'commit-to-db')),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code != 200
    

def test_add_local_context_guest(client):
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

def test_add_command(client):
    """ Test that adding commands works.
    """
    response = client.post(
        '/commands',
        data = json.dumps(dict(
            command = "bot.move_forward(100)",
        )),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200


def test_get_local_context_guest(client):
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


def test_clear_local_context_guest(client):
    # send the clear command
    response = client.post(
        '/chatbot-context',
        data = json.dumps(dict(command = 'reset-context-stack')),
        content_type='application/json'
    )
    # make sure local context is clear now
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
    assert "the sky is green" not in ' '.join(returned_context).lower()

def test_clear_db(client):
    response = client.post(
        '/clear',
        content_type='application/json',
    )
    assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([])
