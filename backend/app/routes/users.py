from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User

users_bp = Blueprint("users_bp", __name__, url_prefix="/api/v1/users")

POINTS_TO_AIRTIME_RATE = 5  # 1 point = 5 KES


# ---------------------
# Get current user's points
# ---------------------
@users_bp.route("/points", methods=["GET"])
@jwt_required()
def get_points():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify({"points": user.points})


# ---------------------
# Redeem points for rewards
# ---------------------
@users_bp.route("/redeem", methods=["POST"])
@jwt_required()
def redeem_points():
    data = request.get_json()
    redeem_points = data.get("points")
    reward_name = data.get("reward")
    if not redeem_points or not reward_name:
        return jsonify({"msg": "Points and reward are required"}), 400

    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    if user.points < redeem_points:
        return jsonify({"msg": "Insufficient points"}), 400

    user.points -= redeem_points
    db.session.commit()

    # Auto-calculate airtime if reward is "airtime"
    airtime_amount = None
    if reward_name.lower() == "airtime":
        airtime_amount = redeem_points * POINTS_TO_AIRTIME_RATE

    msg = f"Redeemed {redeem_points} points for {reward_name}"
    if airtime_amount:
        msg += f" ({airtime_amount} KES airtime)"

    return jsonify({"msg": msg, "points_remaining": user.points})


# ---------------------
# Leaderboard: Top reporters by points
# ---------------------
@users_bp.route("/leaderboard", methods=["GET"])
def leaderboard():
    top_n = int(request.args.get("top", 10))
    users = User.query.order_by(User.points.desc()).limit(top_n).all()
    result = [
        {
            "id": u.id,
            "name": u.name,
            "points": u.points
        } for u in users
    ]
    return jsonify(result)


# ---------------------
# List all users (Admin only)
# ---------------------
@users_bp.route("/", methods=["GET"])
@jwt_required()
def list_users():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if current_user.role != "admin":
        return jsonify({"msg": "Admins only"}), 403

    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "points": u.points
        } for u in users
    ])
