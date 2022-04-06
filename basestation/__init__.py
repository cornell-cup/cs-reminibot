from flask_sqlalchemy import SQLAlchemy
from flask import Flask, current_app
from basestation.databases.user_database import db
from flask import request, render_template, jsonify, session, redirect
import logging

def create_app():
    app = Flask(
        __name__, template_folder='../static/gui/', static_folder='../static/gui/static'
    )
    log = logging.getLogger('werkzeug')
    log.disabled = True
   
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = True

    # db_filename = 'program.db'
    # app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_filename}'  

    db.init_app(app)
    from basestation.databases.user_database import Program, User, Chatbot
    with app.app_context():
      db.create_all()

    # need to import at end of file, after app is created, because routes uses app
    from . import routes
    routes.init_app(app)
   

    return app