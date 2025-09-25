import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "sqlite:///app.db"  # fallback for local development
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "superjwtsecret")

    # Enable SSL for Postgres if URL is Postgres
    if SQLALCHEMY_DATABASE_URI.startswith("postgresql"):
        SQLALCHEMY_ENGINE_OPTIONS = {"connect_args": {"sslmode": "require"}}

    # Mail configuration
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "True") == "True"
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "False") == "True"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER")




# import os

# class Config:
#     # Secret keys
#     SECRET_KEY = os.environ.get("SECRET_KEY")  # required in production
#     JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")  # required in production

#     # Database
#     SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")  # e.g., Postgres URL
#     SQLALCHEMY_TRACK_MODIFICATIONS = False

#     # Email configuration
#     MAIL_SERVER = os.environ.get("MAIL_SERVER")  # e.g., smtp.gmail.com
#     MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
#     MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "True") == "True"
#     MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "False") == "True"
#     MAIL_USERNAME = os.environ.get("MAIL_USERNAME")  # email account
#     MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")  # email password / app password
#     MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER")  # e.g., "noreply@example.com"


# import os

# class Config:
#     SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///db.sqlite3")
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
#     SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret")
