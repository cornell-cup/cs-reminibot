from flask_sqlalchemy import SQLAlchemy
from flask import Flask

app = Flask(
    __name__, template_folder='../static/gui/', static_folder='../static/gui/static'
)
db = SQLAlchemy()
db_filename = 'program.db'

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_filename}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

db.init_app(app)
with app.app_context():
    db.create_all()

# need to import at end of file, after app is created, because routes uses app
from basestation import routes