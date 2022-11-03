from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from .user_database import db


def init_app(app):
    db.init_app(app)
