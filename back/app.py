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
from feature.trendSearch.routes import trend_search_bp
from feature.three3duxPractice.routes import three_d_bp
from feature.sessionSync.routes import session_sync_bp
from feature.electronCapture.routes import electron_capture_bp
from feature.constructionSchedule.routes import construction_schedule_bp
from feature.userService.routes import user_service_bp

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key")
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  # React からのアクセス許可

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
app.register_blueprint(trend_search_bp)
app.register_blueprint(three_d_bp)
app.register_blueprint(session_sync_bp)
app.register_blueprint(electron_capture_bp)
app.register_blueprint(construction_schedule_bp)
app.register_blueprint(user_service_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
