# import bs
# Minibot imports.
import sys
import os
print (sys.path)
sys.path.append('../')
import pytest
import unittest
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from basestation.user_database import Program, User, Chatbot as ChatbotTable
from basestation.base_station import BaseStation



@pytest.fixture
def app():
    app = Flask(
        __name__, template_folder='../static/gui/', static_folder='../static/gui/static'
    )
    db = SQLAlchemy()
    db_filename = 'db_test.db'

    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_filename}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = True

    db.init_app(app)
    return app

    # from basestation.user_database import Program, User


# dont know what is going on below here

def test_make_user(app):
    BaseStation.register('user', 'pass')


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
