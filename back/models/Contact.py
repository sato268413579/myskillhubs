from datetime import datetime
from config.db import db

class Contact(db.Model):
    __tablename__ = "contacts"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)
    contact_type = db.Column(db.String(50), nullable=False)  # "call","email","meeting" など
    note = db.Column(db.Text, nullable=True)
    contact_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # 顧客へのリレーション
    customer = db.relationship("Customer", back_populates="contacts")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "customer_id": self.customer_id,
            "contact_type": self.contact_type,
            "note": self.note,
            "contact_date": self.contact_date.isoformat(),
        }
