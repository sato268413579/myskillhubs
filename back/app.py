from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # React からのアクセス許可

# MySQL設定
db_user = os.environ.get("DB_USER", "root")
db_pass = os.environ.get("DB_PASSWORD", "example")
db_host = os.environ.get("DB_HOST", "db")
db_name = os.environ.get("DB_DATABASE", "myapp")

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# モデル定義
class Customer(db.Model):
    __tablename__ = "customers"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}

# ルート
@app.route("/customers", methods=["GET"])
def get_customers():
    customers = Customer.query.all()
    return jsonify([c.to_dict() for c in customers])

@app.route("/customers", methods=["POST"])
def create_customer():
    data = request.get_json()
    new_c = Customer(name=data["name"], email=data["email"])
    db.session.add(new_c)
    db.session.commit()
    return jsonify(new_c.to_dict()), 201

@app.route("/customers/<int:id>", methods=["PUT"])
def update_customer(id):
    data = request.get_json()
    customer = Customer.query.get_or_404(id)
    customer.name = data["name"]
    customer.email = data["email"]
    db.session.commit()
    return jsonify(customer.to_dict())

@app.route("/customers/<int:id>", methods=["DELETE"])
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
