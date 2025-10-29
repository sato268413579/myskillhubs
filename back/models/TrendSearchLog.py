from datetime import datetime
import pytz
from config.db import db
import json

class TrendSearchLog(db.Model):
    __tablename__ = "trend_search_log"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    trend = db.Column(db.String(50), default='basic')  # basic, advanced, multi_source
    result = db.Column(db.Text, nullable=False)
    
    # タイムスタンプ（日本時間）
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(pytz.timezone('Asia/Tokyo')))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(pytz.timezone('Asia/Tokyo')), onupdate=lambda: datetime.now(pytz.timezone('Asia/Tokyo')))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "trend": self.trend,
            "result": self.result,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
