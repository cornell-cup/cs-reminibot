from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Program(db.Model):
    __tablename__ = 'program'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, nullable=False)
    time = db.Column(db.Integer, nullable=False)

    def __init__(self, **kwargs):
        self.code = kwargs.get('code', '')
        self.time = kwargs.get('time', '')

    def serialize(self):
        return {
            'id': self.id,
            'code': self.code,
            'time': self.time
        }