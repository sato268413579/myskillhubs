from flask import Flask, request, jsonify, session
from flask_login import LoginManager, login_user, login_required, logout_user, current_user, UserMixin
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import bcrypt
from config.db import init_db, db
from feature.crm.routes import crm_bp
from feature.login.routes import login_bp, load_user

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key")
CORS(app)  # React からのアクセス許可

login_manager = LoginManager()
login_manager.init_app(app)

# Flask 3 では app に login_manager を明示的に登録
app.login_manager = login_manager

init_db(app)

# user_loader の登録
@login_manager.user_loader
def user_loader(user_id):
    return load_user(user_id)

# ルート
app.register_blueprint(crm_bp)
app.register_blueprint(login_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
