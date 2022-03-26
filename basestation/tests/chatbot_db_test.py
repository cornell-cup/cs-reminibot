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
        

# @pytest.fixture(scope = "module")
# def base_station(app):
#     return BaseStation(app.debug)


# dont know what is going on below here

# def test_add_user(app, base_station):
#     print("test 1")

#     assert base_station.register('user', 'pass') == 1


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
