from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
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


# ---------------------
# Admin: Edit a user
# PUT /api/v1/users/<user_id>
# ---------------------
@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def edit_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if current_user.role != "admin":
        return jsonify({"msg": "Admins only"}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json()

    # Update fields if provided
    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        # Check if email is already taken by another user
        existing = User.query.filter_by(email=data["email"]).first()
        if existing and existing.id != user_id:
            return jsonify({"msg": "Email already in use"}), 400
        user.email = data["email"]
    if "phone" in data:
        user.phone = data["phone"]
    if "role" in data:
        if data["role"] not in ["user", "admin"]:
            return jsonify({"msg": "Invalid role"}), 400
        user.role = data["role"]
    if "points" in data:
        user.points = data["points"]
    if "password" in data:
        user.password_hash = generate_password_hash(data["password"])

    db.session.commit()
    return jsonify({"msg": "User updated successfully"}), 200


# ---------------------
# Admin: Delete a user
# DELETE /api/v1/users/<user_id>
# ---------------------
@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if current_user.role != "admin":
        return jsonify({"msg": "Admins only"}), 403

    # Prevent admin from deleting themselves
    if int(current_user_id) == user_id:
        return jsonify({"msg": "Cannot delete your own account"}), 400

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "User deleted successfully"}), 200




############################################################################################################################################################################



# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from app.extensions import db
# from app.models import User

# users_bp = Blueprint("users_bp", __name__, url_prefix="/api/v1/users")

# POINTS_TO_AIRTIME_RATE = 5  # 1 point = 5 KES

# # ---------------------
# # Get current user's points
# # ---------------------
# @users_bp.route("/points", methods=["GET"])
# @jwt_required()
# def get_points():
#     user_id = get_jwt_identity()
#     user = User.query.get_or_404(user_id)
#     return jsonify({"points": user.points})


# # ---------------------
# # Redeem points for rewards
# # ---------------------
# @users_bp.route("/redeem", methods=["POST"])
# @jwt_required()
# def redeem_points():
#     data = request.get_json()
#     redeem_points = data.get("points")
#     reward_name = data.get("reward")
#     if not redeem_points or not reward_name:
#         return jsonify({"msg": "Points and reward are required"}), 400

#     user_id = get_jwt_identity()
#     user = User.query.get_or_404(user_id)

#     if user.points < redeem_points:
#         return jsonify({"msg": "Insufficient points"}), 400

#     user.points -= redeem_points
#     db.session.commit()

#     # Auto-calculate airtime if reward is "airtime"
#     airtime_amount = None
#     if reward_name.lower() == "airtime":
#         airtime_amount = redeem_points * POINTS_TO_AIRTIME_RATE

#     msg = f"Redeemed {redeem_points} points for {reward_name}"
#     if airtime_amount:
#         msg += f" ({airtime_amount} KES airtime)"

#     return jsonify({"msg": msg, "points_remaining": user.points})


# # ---------------------
# # Leaderboard: Top reporters by points
# # ---------------------
# @users_bp.route("/leaderboard", methods=["GET"])
# def leaderboard():
#     top_n = int(request.args.get("top", 10))
#     users = User.query.order_by(User.points.desc()).limit(top_n).all()
#     result = [
#         {
#             "id": u.id,
#             "name": u.name,
#             "points": u.points
#         } for u in users
#     ]
#     return jsonify(result)


# # ---------------------
# # List all users (Admin only)
# # ---------------------
# @users_bp.route("/", methods=["GET"])
# @jwt_required()
# def list_users():
#     current_user_id = get_jwt_identity()
#     current_user = User.query.get(current_user_id)

#     if current_user.role != "admin":
#         return jsonify({"msg": "Admins only"}), 403

#     users = User.query.all()
#     return jsonify([
#         {
#             "id": u.id,
#             "name": u.name,
#             "email": u.email,
#             "role": u.role,
#             "points": u.points
#         } for u in users
#     ])

#############################################################################################################################################################################

# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from app.extensions import db
# from app.models import User

# users_bp = Blueprint("users_bp", __name__, url_prefix="/api/v1/users")

# POINTS_TO_AIRTIME_RATE = 5  # 1 point = 5 KES


# # ---------------------
# # Get current user's points
# # ---------------------
# @users_bp.route("/points", methods=["GET"], strict_slashes=False)
# @jwt_required()
# def get_points():
#     user_id = get_jwt_identity()
#     user = User.query.get_or_404(user_id)
#     return jsonify({"points": user.points})


# # ---------------------
# # Redeem points for rewards
# # ---------------------
# @users_bp.route("/redeem", methods=["POST"], strict_slashes=False)
# @jwt_required()
# def redeem_points():
#     data = request.get_json()
#     redeem_points = data.get("points")
#     reward_name = data.get("reward")
#     if not redeem_points or not reward_name:
#         return jsonify({"msg": "Points and reward are required"}), 400

#     user_id = get_jwt_identity()
#     user = User.query.get_or_404(user_id)

#     if user.points < redeem_points:
#         return jsonify({"msg": "Insufficient points"}), 400

#     user.points -= redeem_points
#     db.session.commit()

#     # Auto-calculate airtime if reward is "airtime"
#     airtime_amount = None
#     if reward_name.lower() == "airtime":
#         airtime_amount = redeem_points * POINTS_TO_AIRTIME_RATE

#     msg = f"Redeemed {redeem_points} points for {reward_name}"
#     if airtime_amount:
#         msg += f" ({airtime_amount} KES airtime)"

#     return jsonify({"msg": msg, "points_remaining": user.points})


# # ---------------------
# # Leaderboard: Top reporters by points
# # ---------------------
# @users_bp.route("/leaderboard", methods=["GET"], strict_slashes=False)
# def leaderboard():
#     top_n = int(request.args.get("top", 10))
#     users = User.query.order_by(User.points.desc()).limit(top_n).all()
#     result = [
#         {
#             "id": u.id,
#             "name": u.name,
#             "points": u.points
#         } for u in users
#     ]
#     return jsonify(result)


# # ---------------------
# # List all users (Admin only)
# # ---------------------
# @users_bp.route("/", methods=["GET"], strict_slashes=False)
# @jwt_required()
# def list_users():
#     current_user_id = get_jwt_identity()
#     current_user = User.query.get(current_user_id)

#     if current_user.role != "admin":
#         return jsonify({"msg": "Admins only"}), 403

#     users = User.query.all()
#     return jsonify([
#         {
#             "id": u.id,
#             "name": u.name,
#             "email": u.email,
#             "role": u.role,
#             "points": u.points
#         } for u in users
#     ])



# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from app.extensions import db
# from app.models import User

# users_bp = Blueprint("users_bp", __name__, url_prefix="/api/v1/users", strict_slashes=False)

# POINTS_TO_AIRTIME_RATE = 5  # 1 point = 5 KES


# # ---------------------
# # Get current user's points
# # ---------------------
# @users_bp.route("/points", methods=["GET"])
# @jwt_required()
# def get_points():
#     user_id = get_jwt_identity()
#     user = User.query.get_or_404(user_id)
#     return jsonify({"points": user.points})


# # ---------------------
# # Redeem points for rewards
# # ---------------------
# @users_bp.route("/redeem", methods=["POST"])
# @jwt_required()
# def redeem_points():
#     data = request.get_json()
#     redeem_points = data.get("points")
#     reward_name = data.get("reward")
#     if not redeem_points or not reward_name:
#         return jsonify({"msg": "Points and reward are required"}), 400

#     user_id = get_jwt_identity()
#     user = User.query.get_or_404(user_id)

#     if user.points < redeem_points:
#         return jsonify({"msg": "Insufficient points"}), 400

#     user.points -= redeem_points
#     db.session.commit()

#     # Auto-calculate airtime if reward is "airtime"
#     airtime_amount = None
#     if reward_name.lower() == "airtime":
#         airtime_amount = redeem_points * POINTS_TO_AIRTIME_RATE

#     msg = f"Redeemed {redeem_points} points for {reward_name}"
#     if airtime_amount:
#         msg += f" ({airtime_amount} KES airtime)"

#     return jsonify({"msg": msg, "points_remaining": user.points})


# # ---------------------
# # Leaderboard: Top reporters by points
# # ---------------------
# @users_bp.route("/leaderboard", methods=["GET"])
# def leaderboard():
#     top_n = int(request.args.get("top", 10))
#     users = User.query.order_by(User.points.desc()).limit(top_n).all()
#     result = [
#         {
#             "id": u.id,
#             "name": u.name,
#             "points": u.points
#         } for u in users
#     ]
#     return jsonify(result)


# # ---------------------
# # List all users (Admin only)
# # ---------------------
# @users_bp.route("/", methods=["GET"])
# @jwt_required()
# def list_users():
#     current_user_id = get_jwt_identity()
#     current_user = User.query.get(current_user_id)

#     if current_user.role != "admin":
#         return jsonify({"msg": "Admins only"}), 403

#     users = User.query.all()
#     return jsonify([
#         {
#             "id": u.id,
#             "name": u.name,
#             "email": u.email,
#             "role": u.role,
#             "points": u.points
#         } for u in users
#     ])
