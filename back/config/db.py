import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db_user = os.environ.get("DB_USER", "root")
    db_pass = os.environ.get("DB_PASSWORD", "example")
    db_host = os.environ.get("DB_HOST", "db")
    db_name = os.environ.get("DB_DATABASE", "myapp")

    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    return db
