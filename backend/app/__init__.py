from flask import Flask, request, jsonify
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate, jwt, mail

# Import Blueprints
from .routes.auth import auth_bp
from .routes.incidents import incidents_bp
from .routes.media import media_bp
from .routes.comments import comments_bp
from .routes.admin import admin_bp
from .routes.users import users_bp
from .routes.migrate import migrate_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # CORS Configuration - FIXED
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://127.0.0.1:5173",
                "http://localhost:5173",
                "https://sdf-pt-10-group-09.vercel.app"
            ],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "expose_headers": ["Content-Type", "Authorization"]
        }
    })

    # Ensure MAIL_DEFAULT_SENDER is correctly set
    sender = app.config.get("MAIL_DEFAULT_SENDER")
    if sender:
        app.config["MAIL_DEFAULT_SENDER"] = sender

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/v1')
    app.register_blueprint(users_bp, url_prefix='/api/v1')
    app.register_blueprint(incidents_bp, url_prefix='/api/v1')
    app.register_blueprint(media_bp, url_prefix='/api/v1')
    app.register_blueprint(comments_bp, url_prefix='/api/v1')
    app.register_blueprint(admin_bp, url_prefix='/api/v1')
    app.register_blueprint(migrate_bp, url_prefix='/api/v1')

# FIXED after_request handler
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        
        # Only allow specific origins
        allowed_origins = [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "https://sdf-pt-10-group-09.vercel.app"
        ]
        
        if origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            
        if request.method == 'OPTIONS':
            response.headers['Access-Control-Max-Age'] = '86400'
            return response
            
        return response

    return app