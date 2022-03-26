""" Test file for chatbot database.

*** IMPORTANT ***
The test will not pass unless 



Command to run: python chatbot_db_test.py
"""




# import bs
# Minibot imports.
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
    resp = client.get('/ping')
    data = json.loads(resp.data.decode())
    assert resp.status_code == 200
    assert 'pong' in data['message']
    assert 'success' in data['status']


def test_add_user(client):
    """Ensure a new user can be added to the database."""
   
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
    """Test that adding context works"""
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
    # make sure local context was updated
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
    # commit it to db
    response = client.post(
        '/chatbot-context',
        data = json.dumps(dict(command = 'commit-to-db')),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    
def test_get_db_context(client):
    # get back what we just committed
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
# 

    


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
