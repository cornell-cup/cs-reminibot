from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Program(db.Model):
    __tablename__ = 'program'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, nullable=False)

    def __init__(self, **kwargs):
        self.code = kwargs.get('code', '')

    def serialize(self):
        return {
            'id': self.id,
            'code': self.code
        }