from flask_login import UserMixin
from config.db import db

class User(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def to_dict(self):
        return {"id": self.id, "username": self.username, "password_hash": self.password_hash}