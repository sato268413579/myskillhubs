from config.db import db
from models.Tag import customer_tags  # Tag は使わない。循環参照を避ける

class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120))
    department = db.Column(db.String(120))
    title = db.Column(db.String(120))
    phone = db.Column(db.String(50))
    mobile = db.Column(db.String(50))
    address = db.Column(db.String(50))
    note = db.Column(db.Text)

    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    # タグとのリレーション
    tags = db.relationship(
        "Tag",
        secondary=customer_tags,
        back_populates="customers"
    )
    # ディールとのリレーション
    deals = db.relationship(
        "Deal",
        back_populates="customer",
        cascade="all, delete-orphan"
    )
    # コンタクトとのリレーション
    contacts = db.relationship(
        "Contact",
        back_populates="customer",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "company": self.company,
            "department": self.department,
            "title": self.title,
            "phone": self.phone,
            "mobile": self.mobile,
            "address": self.address,
            "note": self.note,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "tags": [t.name for t in self.tags],
            "deals": [t.to_dict() for t in self.deals],
            "contacts": [t.to_dict() for t in self.contacts],
        }
