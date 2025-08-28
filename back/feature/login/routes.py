from flask import Blueprint, request, jsonify
from flask_login import login_user, login_required, logout_user
import bcrypt

from models.User import User
from config.db import db

login_bp = Blueprint("login", __name__, url_prefix="/")

# Flask-Login 用: user_loader は app.py 側で login_manager に登録する
def load_user(user_id):
    return User.query.get(int(user_id))

@login_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if user and bcrypt.checkpw(data["password"].encode('utf-8'), user.password_hash.encode('utf-8')):
        login_user(user)
        return jsonify({"message": "ログイン成功"})
    return jsonify({"message": "ユーザー名またはパスワードが違います"}), 401

@login_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "ログアウトしました"})
