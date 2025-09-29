from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from app import create_app, db
from flask_migrate import upgrade

app = create_app()

# Run migrations at startup
with app.app_context():
    upgrade()

if __name__ == "__main__":
    app.run()