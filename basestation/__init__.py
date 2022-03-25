from flask_sqlalchemy import SQLAlchemy
from flask import Flask, current_app
from basestation.databases.user_database import db
from flask import request, render_template, jsonify, session, redirect

def create_app():
    app = Flask(
        __name__, template_folder='../static/gui/', static_folder='../static/gui/static'
    )
   
    
    from basestation.databases import db


    db_filename = 'program.db'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_filename}'  

    from basestation.databases.user_database import Program, User, Chatbot
    db.init_app(app)
    with app.app_context():
      db.create_all()

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = True

    # need to import at end of file, after app is created, because routes uses app
    from . import routes
    routes.init_app(app)
   

    return app