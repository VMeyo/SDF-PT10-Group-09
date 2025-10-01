# app/__init__.py
from flask import Flask, request
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

    # -----------------------------
    # CORS Configuration
    # -----------------------------
    CORS(
        app,
        resources={r"/api/*": {"origins": [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "https://sdf-pt-10-group-09.vercel.app"
        ]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type", "Authorization"]
    )

    # -----------------------------
    # Allow OPTIONS preflight for all routes
    # -----------------------------
    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            return '', 200

    # -----------------------------
    # Initialize extensions
    # -----------------------------
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # -----------------------------
    # Register Blueprints
    # -----------------------------
    app.register_blueprint(auth_bp, url_prefix='/api/v1')
    app.register_blueprint(users_bp, url_prefix='/api/v1')
    app.register_blueprint(incidents_bp, url_prefix='/api/v1')
    app.register_blueprint(media_bp, url_prefix='/api/v1')
    app.register_blueprint(comments_bp, url_prefix='/api/v1')
    app.register_blueprint(admin_bp, url_prefix='/api/v1')
    app.register_blueprint(migrate_bp, url_prefix='/api/v1')

    return app



# from flask import Flask
# from flask_cors import CORS
# from .config import Config
# from .extensions import db, migrate, jwt, mail

# # Import Blueprints
# from .routes.auth import auth_bp
# from .routes.incidents import incidents_bp
# from .routes.media import media_bp
# from .routes.comments import comments_bp
# from .routes.admin import admin_bp
# from .routes.users import users_bp
# from .routes.migrate import migrate_bp

# def create_app(config_class=Config):
#     app = Flask(__name__)
#     app.config.from_object(config_class)

#     # Enable CORS for frontend URLs
#     CORS(app, resources={r"/*": {"origins": ["https://sdf-pt-10-group-09.vercel.app", "http://localhost:5173"]}})

#     # Ensure MAIL_DEFAULT_SENDER is correctly set
#     sender = app.config.get("MAIL_DEFAULT_SENDER")
#     if sender:
#         app.config["MAIL_DEFAULT_SENDER"] = sender

#     # Initialize extensions
#     db.init_app(app)
#     migrate.init_app(app, db)
#     jwt.init_app(app)
#     mail.init_app(app)

#     # Register Blueprints
#     app.register_blueprint(auth_bp)
#     app.register_blueprint(users_bp)
#     app.register_blueprint(incidents_bp)
#     app.register_blueprint(media_bp)
#     app.register_blueprint(comments_bp)
#     app.register_blueprint(admin_bp)
#     app.register_blueprint(migrate_bp)

#     return app



# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from .config import Config
# from .extensions import db, migrate, jwt, mail

# # Import Blueprints
# from .routes.auth import auth_bp
# from .routes.incidents import incidents_bp
# from .routes.media import media_bp
# from .routes.comments import comments_bp
# from .routes.admin import admin_bp
# from .routes.users import users_bp
# from .routes.migrate import migrate_bp

# def create_app(config_class=Config):
#     app = Flask(__name__)
#     app.config.from_object(config_class)

#     # CORS Configuration - FIXED
#     CORS(app, resources={
#         r"/api/*": {
#             "origins": [
#                 "http://127.0.0.1:5173",
#                 "http://localhost:5173",
#                 "https://sdf-pt-10-group-09.vercel.app"
#             ],
#             "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
#             "allow_headers": ["Content-Type", "Authorization"],
#             "supports_credentials": True,
#             "expose_headers": ["Content-Type", "Authorization"]
#         }
#     })

#     sender = app.config.get("MAIL_DEFAULT_SENDER")
#     if sender:
#         app.config["MAIL_DEFAULT_SENDER"] = sender

#     # Initialize extensions
#     db.init_app(app)
#     migrate.init_app(app, db)
#     jwt.init_app(app)
#     mail.init_app(app)

#     # Register Blueprints
#     app.register_blueprint(auth_bp, url_prefix='/api/v1')
#     app.register_blueprint(users_bp, url_prefix='/api/v1')
#     app.register_blueprint(incidents_bp, url_prefix='/api/v1')
#     app.register_blueprint(media_bp, url_prefix='/api/v1')
#     app.register_blueprint(comments_bp, url_prefix='/api/v1')
#     app.register_blueprint(admin_bp, url_prefix='/api/v1')
#     app.register_blueprint(migrate_bp, url_prefix='/api/v1')


#     return app