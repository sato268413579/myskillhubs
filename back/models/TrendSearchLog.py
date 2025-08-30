from datetime import datetime
from config.db import db

class TrendSearchLog(db.Model):
    __tablename__ = "trand_search_log"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
        }
