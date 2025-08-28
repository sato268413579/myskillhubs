# models/Tag.py
from config.db import db

# 中間テーブル
customer_tags = db.Table(
    "customer_tags",
    db.Column("customer_id", db.Integer, db.ForeignKey("customers.id"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id"), primary_key=True)
)

class Tag(db.Model):
    __tablename__ = "tags"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    # リレーション（逆参照）
    customers = db.relationship(
        "Customer",
        secondary=customer_tags,
        back_populates="tags"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
        }
