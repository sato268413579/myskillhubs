from datetime import datetime
from config.db import db

class Deal(db.Model):
    __tablename__ = "deals"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=True)
    status = db.Column(db.String(50), nullable=True)  # e.g. "open","won","lost"
    closed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # 顧客へのリレーション
    customer = db.relationship("Customer", back_populates="deals")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "customer_id": self.customer_id,
            "title": self.title,
            "amount": float(self.amount) if self.amount is not None else None,
            "status": self.status,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
            "created_at": self.created_at.isoformat(),
        }
