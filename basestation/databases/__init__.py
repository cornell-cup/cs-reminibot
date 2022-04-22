from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from .user_database import db


def init_app(app):
    # db_filename = 'test.db'
    # app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_filename}'
    db.init_app(app)
