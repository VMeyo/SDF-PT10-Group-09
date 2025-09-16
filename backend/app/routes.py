from flask import Blueprint, jsonify

api_bp = Blueprint('api', __name__)


@api_bp.route("/")
def index():
    return {"message": "Ajali backend is running!"}


@api_bp.route("/hello")
def hello():
    return jsonify({"message": "Hello World from Ajali API"})
