from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object("app.config.Config")
    
    db.init_app(app)
    jwt.init_app(app)
    
    from app.routes import api_bp
    from app.auth import auth_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    # app.register_blueprint(api_bp, url_prefix='/api/v1')
    app.register_blueprint(api_bp)  # no prefix

    
    return app
