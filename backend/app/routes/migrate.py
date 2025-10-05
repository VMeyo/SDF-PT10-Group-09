from flask import Blueprint, jsonify
from flask_migrate import upgrade, current, show
import os

migrate_bp = Blueprint("migrate", __name__, url_prefix="/migrate")

@migrate_bp.route("/upgrade", methods=["GET"])
def run_upgrade():
    try:
        upgrade()
        return jsonify({"msg": "Database upgraded successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@migrate_bp.route("/status", methods=["GET"])
def migration_status():
    try:
        # Get current migration version
        current_rev = current()
        return jsonify({
            "current_revision": current_rev,
            "msg": "Migration status retrieved"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500