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
    
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    # Validation
    if not all([name, email, password]):
        return jsonify({"message": "Name, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters long"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400

    # Create user
    user = User(name=name, email=email, phone=phone, role="user")
    user.password = password
    
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# ---------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No data provided"}), 401
    
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

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
    user = User.query.get_or_404(user_id)

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
# Forgot password (send reset email)
# POST /api/v1/auth/forgot-password
# ---------------------
@auth_bp.route("/forgot-password", methods=["POST", "OPTIONS"])
def forgot_password():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return jsonify({"message": "OK"}), 200
    
    data = request.get_json()
    email = data.get("email")
    
    if not email:
        return jsonify({"message": "Email is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Email not registered"}), 404
    
    try:
        # Generate reset token
        token = generate_token(user.email)
        reset_url = f"https://sdf-pt-10-group-09.vercel.app/reset-password?token={token}"
        
        # Send email
        msg = Message(
            "Password Reset Request",
            recipients=[user.email],
            html=f"""
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Click the link below to reset it:</p>
            <p><a href="{reset_url}">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
            """
        )
        mail.send(msg)
        
        return jsonify({"message": "Password reset email sent"}), 200
    
    except Exception as e:
        print(f"[ERROR] Failed to send password reset email: {str(e)}")
        # Still return success to prevent email enumeration attacks
        return jsonify({"message": "Password reset email sent"}), 200


# ---------------------
@auth_bp.route("/reset-password/<token>", methods=["POST", "OPTIONS"])
def reset_password(token):
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return jsonify({"message": "OK"}), 200
    
    email = verify_token(token)
    if not email:
        return jsonify({"message": "Invalid or expired token"}), 400
    
    data = request.get_json()
    new_password = data.get("new_password")
    
    if not new_password:
        return jsonify({"message": "New password is required"}), 400
    
    if len(new_password) < 6:
        return jsonify({"message": "Password must be at least 6 characters long"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.password = new_password
    db.session.commit()
    
    return jsonify({"message": "Password reset successfully"}), 200


# ---------------------
# Change password (Authenticated user)
# ---------------------
@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get_or_404(user_id)

        data = request.get_json()
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        confirm_new_password = data.get("confirm_new_password")

        if not all([current_password, new_password, confirm_new_password]):
            return jsonify({"message": "All password fields are required"}), 400

        if new_password != confirm_new_password:
            return jsonify({"message": "New password and confirmation do not match"}), 400

        if len(new_password) < 6:
            return jsonify({"message": "Password must be at least 6 characters long"}), 400

        if not user.check_password(current_password):
            return jsonify({"message": "Incorrect current password"}), 401

        user.password = new_password
        db.session.commit()

        return jsonify({"message": "Password changed successfully"}), 200
    
    except Exception as e:
        print(f"[ERROR] Change password failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Internal server error"}), 500


# ---------------------
# Promote user (Admin only)
# ---------------------
@auth_bp.route("/users/<int:user_id>/promote", methods=["PUT"])
@jwt_required()
def promote_user(user_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get_or_404(current_user_id)

    if current_user.role != "admin":
        return jsonify({"message": "Admins only"}), 403

    user = User.query.get_or_404(user_id)
    user.role = "admin"
    db.session.commit()

    return jsonify({"message": f"User {user.email} promoted to admin"}), 200










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