from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from werkzeug.security import check_password_hash, generate_password_hash
from app.extensions import db, mail
from app.models import User
from flask_mail import Message

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/v1/auth")


# ---------------------
# Token helpers
# ---------------------
def generate_token(email):
    s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return s.dumps(email, salt="password-reset-salt")


def verify_token(token, expiration=3600):
    s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        email = s.loads(token, salt="password-reset-salt", max_age=expiration)
        return email
    except (SignatureExpired, BadSignature):
        return None


# ---------------------
# Signup
# ---------------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already registered"}), 400

    user = User(name=name, email=email, phone=phone, role="user")
    user.password = generate_password_hash(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201


# ---------------------
# Login
# ---------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "points": user.points
        }
    })


# ---------------------
# Current logged-in user
# ---------------------
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "points": user.points
    })


# ---------------------
# Refresh token
# ---------------------
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = int(get_jwt_identity())
    access_token = create_access_token(identity=str(user_id))
    return jsonify({"access_token": access_token})


# ---------------------
# Get security question (for password reset)
# POST /api/v1/auth/security-question
# ---------------------
@auth_bp.route("/security-question", methods=["POST"])
def get_security_question():
    data = request.get_json()
    email = data.get("email")
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Email not registered"}), 404

    if not user.security_question:
        return jsonify({"msg": "No security question set for this account"}), 404

    return jsonify({
        "security_question": user.security_question
    }), 200


# ---------------------
# Verify security answer and reset password
# POST /api/v1/auth/reset-password-security
# ---------------------
@auth_bp.route("/reset-password-security", methods=["POST"])
def reset_password_security():
    data = request.get_json()
    email = data.get("email")
    security_answer = data.get("security_answer")
    new_password = data.get("new_password")
    
    if not all([email, security_answer, new_password]):
        return jsonify({"msg": "Email, security answer, and new password are required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if not user.security_answer:
        return jsonify({"msg": "No security question set for this account"}), 404

    # Verify security answer
    if not check_password_hash(user.security_answer, security_answer.lower().strip()):
        return jsonify({"msg": "Incorrect security answer"}), 401

    user.password = new_password
    db.session.commit()
    
    return jsonify({"msg": "Password reset successfully"}), 200


# ---------------------
# Update security question (Authenticated user)
# PUT /api/v1/auth/security-question
# ---------------------
@auth_bp.route("/security-question", methods=["PUT"])
@jwt_required()
def update_security_question():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    data = request.get_json()
    security_question = data.get("security_question")
    security_answer = data.get("security_answer")
    current_password = data.get("current_password")
    
    if not all([security_question, security_answer, current_password]):
        return jsonify({"msg": "Security question, answer, and current password are required"}), 400
    
    # Verify current password
    if not user.check_password(current_password):
        return jsonify({"msg": "Incorrect current password"}), 401
    
    # Update security question and answer
    user.security_question = security_question
    user.security_answer = generate_password_hash(security_answer.lower().strip())
    db.session.commit()
    
    return jsonify({"msg": "Security question updated successfully"}), 200


# ---------------------
# Verify phone number exists
# POST /api/v1/auth/verify-phone
# ---------------------
@auth_bp.route("/verify-phone", methods=["POST"])
def verify_phone():
    data = request.get_json()
    phone = data.get("phone")
    
    if not phone:
        return jsonify({"msg": "Phone number is required"}), 400
    
    user = User.query.filter_by(phone=phone).first()
    if not user:
        return jsonify({"msg": "Phone number not registered"}), 404
    
    # Mask email for privacy: john@example.com -> j***@example.com
    masked_email = user.email[0] + "***@" + user.email.split("@")[1] if "@" in user.email else "***"
    
    return jsonify({
        "msg": "Phone number verified",
        "email": masked_email
    }), 200


# ---------------------
# Reset password using phone number
# POST /api/v1/auth/reset-password-phone
# ---------------------
@auth_bp.route("/reset-password-phone", methods=["POST"])
def reset_password_phone():
    data = request.get_json()
    phone = data.get("phone")
    new_password = data.get("new_password")
    
    if not phone or not new_password:
        return jsonify({"msg": "Phone number and new password are required"}), 400
    
    user = User.query.filter_by(phone=phone).first()
    if not user:
        return jsonify({"msg": "Phone number not registered"}), 404
    
    # Update password (using the User model's password setter)
    user.password = new_password
    db.session.commit()
    
    return jsonify({"msg": "Password reset successfully"}), 200


# ---------------------
# Send password reset email
# POST /api/v1/auth/request-password-reset
# ---------------------
@auth_bp.route("/request-password-reset", methods=["POST"])
def request_password_reset():
    data = request.get_json()
    email = data.get("email")
    
    if not email:
        return jsonify({"msg": "Email is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Email not registered"}), 404

    token = generate_token(email)
    reset_url = url_for("auth_bp.password_reset", token=token, _external=True)

    try:
        msg = Message(
            subject="Password Reset Request",
            recipients=[email],
            body=f"Hi {user.name},\n\nClick the link to reset your password: {reset_url}\n\nIf you did not request this, ignore this email.",
            sender=current_app.config["MAIL_DEFAULT_SENDER"]
        )
        mail.send(msg)
    except Exception as e:
        print(f"Email send failed: {e}")
        return jsonify({"msg": "Failed to send email"}), 500
    
    return jsonify({"msg": "Password reset email sent"}), 200


# ---------------------
# Reset password with token (from email link)
# POST /api/v1/auth/password-reset/<token>
# ---------------------
@auth_bp.route("/password-reset/<token>", methods=["POST"])
def password_reset(token):
    email = verify_token(token)
    if not email:
        return jsonify({"msg": "Invalid or expired token"}), 400
    
    data = request.get_json()
    new_password = data.get("new_password")
    
    if not new_password:
        return jsonify({"msg": "New password is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    user.password = new_password
    db.session.commit()
    
    return jsonify({"msg": "Password reset successfully"}), 200


# ---------------------
# Change password (Authenticated user)
# PUT /api/v1/auth/change-password
# ---------------------
@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    confirm_new_password = data.get("confirm_new_password")

    if not all([current_password, new_password, confirm_new_password]):
        return jsonify({"msg": "All fields are required"}), 400

    if new_password != confirm_new_password:
        return jsonify({"msg": "New password and confirmation do not match"}), 400

    # Use the User model's check_password method
    if not user.check_password(current_password):
        return jsonify({"msg": "Incorrect current password"}), 401

    # Use the User model's password setter
    user.password = new_password
    db.session.commit()

    return jsonify({"msg": "Password changed successfully"}), 200


# ---------------------
# Promote user (Admin only)
# ---------------------
@auth_bp.route("/users/<int:user_id>/promote", methods=["PUT"])
@jwt_required()
def promote_user(user_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if current_user.role != "admin":
        return jsonify({"msg": "Admins only"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    user.role = "admin"
    db.session.commit()

    return jsonify({"msg": f"User {user.email} promoted to admin"}), 200










# from flask import Blueprint, request, jsonify, current_app, url_for
# from flask_jwt_extended import (
#     create_access_token,
#     create_refresh_token,
#     jwt_required,
#     get_jwt_identity,
# )
# from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
# from app.extensions import db, mail
# from app.models import User
# from flask_mail import Message

# auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/v1/auth")


# # ---------------------
# # Token helpers
# # ---------------------
# def generate_token(email):
#     s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
#     return s.dumps(email, salt="password-reset-salt")


# def verify_token(token, expiration=3600):
#     s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
#     try:
#         email = s.loads(token, salt="password-reset-salt", max_age=expiration)
#         return email
#     except (SignatureExpired, BadSignature):
#         return None


# # ---------------------
# # Signup
# # ---------------------
# @auth_bp.route("/signup", methods=["POST"])
# def signup():
#     data = request.get_json()
#     name = data.get("name")
#     email = data.get("email")
#     phone = data.get("phone")
#     password = data.get("password")
#     security_question = data.get("security_question")
#     security_answer = data.get("security_answer")

#     if User.query.filter_by(email=email).first():
#         return jsonify({"msg": "Email already registered"}), 400

#     # Security question is optional but recommended
#     user = User(name=name, email=email, phone=phone, role="user")
#     user.password = password
#     db.session.add(user)
#     db.session.commit()

#     return jsonify({"msg": "User registered successfully"}), 201


# # ---------------------
# # Login
# # ---------------------
# @auth_bp.route("/login", methods=["POST"])
# def login():
#     data = request.get_json()
#     email = data.get("email")
#     password = data.get("password")

#     user = User.query.filter_by(email=email).first()
#     if not user or not user.check_password(password):
#         return jsonify({"msg": "Invalid credentials"}), 401

#     access_token = create_access_token(identity=str(user.id))
#     refresh_token = create_refresh_token(identity=str(user.id))

#     return jsonify({
#         "access_token": access_token,
#         "refresh_token": refresh_token,
#         "user": {
#             "id": user.id,
#             "name": user.name,
#             "email": user.email,
#             "role": user.role,
#             "points": user.points
#         }
#     })


# # ---------------------
# # Current logged-in user
# # ---------------------
# @auth_bp.route("/me", methods=["GET"])
# @jwt_required()
# def me():
#     user_id = int(get_jwt_identity())
#     user = User.query.get(user_id)
#     if not user:
#         return jsonify({"msg": "User not found"}), 404

#     return jsonify({
#         "id": user.id,
#         "name": user.name,
#         "email": user.email,
#         "role": user.role,
#         "points": user.points
#     })


# # ---------------------
# # Refresh token
# # ---------------------
# @auth_bp.route("/refresh", methods=["POST"])
# @jwt_required(refresh=True)
# def refresh():
#     user_id = int(get_jwt_identity())
#     access_token = create_access_token(identity=str(user_id))
#     return jsonify({"access_token": access_token})


# # Email-based password reset removed - using security questions only


# # ---------------------
# # Get security question (for password reset)
# # POST /api/v1/auth/security-question
# # ---------------------
# @auth_bp.route("/security-question", methods=["POST"])
# def get_security_question():
#     data = request.get_json()
#     email = data.get("email")
    
#     user = User.query.filter_by(email=email).first()
#     if not user:
#         return jsonify({"msg": "Email not registered"}), 404

#     token = generate_token(email)
#     reset_url = url_for("auth_bp.password_reset", token=token, _external=True)

#     msg = Message(
#         subject="Password Reset Request",
#         recipients=[email],
#         body=f"Hi {user.name},\n\nClick the link to reset your password: {reset_url}\n\nIf you did not request this, ignore this email.",
#         sender=current_app.config["MAIL_DEFAULT_SENDER"]  # ✅ ensure sender is set
#     )
#     mail.send(msg)
#     return jsonify({"msg": "Password reset email sent"}), 200


# # ---------------------
# # Verify security answer and reset password
# # POST /api/v1/auth/reset-password-security
# # ---------------------
# @auth_bp.route("/reset-password-security", methods=["POST"])
# def reset_password_security():
#     data = request.get_json()
#     email = data.get("email")
#     security_answer = data.get("security_answer")
#     new_password = data.get("new_password")
    
#     if not all([email, security_answer, new_password]):
#         return jsonify({"msg": "Email, security answer, and new password are required"}), 400
    
#     user = User.query.filter_by(email=email).first()
#     if not user:
#         return jsonify({"msg": "User not found"}), 404

#     user.password = new_password
#     db.session.commit()
    
#     return jsonify({"msg": "Password reset successfully"}), 200


# # ---------------------
# # Update security question (Authenticated user)
# # PUT /api/v1/auth/security-question
# # ---------------------
# @auth_bp.route("/security-question", methods=["PUT"])
# @jwt_required()
# def update_security_question():
#     user_id = int(get_jwt_identity())
#     user = User.query.get(user_id)
    
#     if not user:
#         return jsonify({"msg": "User not found"}), 404
    
#     data = request.get_json()
#     security_question = data.get("security_question")
#     security_answer = data.get("security_answer")
#     current_password = data.get("current_password")
    
#     if not all([security_question, security_answer, current_password]):
#         return jsonify({"msg": "Security question, answer, and current password are required"}), 400
    
#     # Verify current password
#     if not check_password_hash(user.password, current_password):
#         return jsonify({"msg": "Incorrect current password"}), 401
    
#     # Update security question and answer
#     user.security_question = security_question
#     user.security_answer = generate_password_hash(security_answer.lower().strip())
#     db.session.commit()
    
#     return jsonify({"msg": "Security question updated successfully"}), 200


# # ---------------------
# # Promote user (Admin only)
# # ---------------------
# @auth_bp.route("/users/<int:user_id>/promote", methods=["PUT"])
# @jwt_required()
# def promote_user(user_id):
#     current_user_id = int(get_jwt_identity())
#     current_user = User.query.get(current_user_id)

#     if current_user.role != "admin":
#         return jsonify({"msg": "Admins only"}), 403

#     user = User.query.get(user_id)
#     if not user:
#         return jsonify({"msg": "User not found"}), 404

#     user.role = "admin"
#     db.session.commit()

#     return jsonify({"msg": f"User {user.email} promoted to admin"}), 200

# # ---------------------
# # Change password (Authenticated user)
# # ---------------------
# @auth_bp.route("/change-password", methods=["PUT"])
# @jwt_required()
# def change_password():
#     user_id = int(get_jwt_identity())
#     user = User.query.get(user_id)

#     if not user:
#         return jsonify({"msg": "User not found"}), 404

#     data = request.get_json()
#     current_password = data.get("current_password")
#     new_password = data.get("new_password")
#     confirm_new_password = data.get("confirm_new_password")

#     if new_password != confirm_new_password:
#         return jsonify({"msg": "New password and confirmation do not match"}), 400

#     if not check_password_hash(user.password_hash, current_password):
#         return jsonify({"msg": "Incorrect current password"}), 401

#     user.password_hash = generate_password_hash(new_password)
#     db.session.commit()

#     return jsonify({"msg": "Password changed successfully"}), 200