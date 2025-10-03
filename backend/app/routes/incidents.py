from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Incident, Media, User

incidents_bp = Blueprint("incidents_bp", __name__, url_prefix="/api/v1/incidents")


# -------------------------------------------------
# Helper: format media list
# -------------------------------------------------
def format_media_list(incident):
    """Return a list of media dicts for the given incident."""
    return [
        {
            "id": m.id,
            "filename": m.filename,
            "file_url": m.file_url,       # ✅ Public URL or relative path
            "uploaded_by": m.uploaded_by,
            "created_at": m.created_at
        }
        for m in incident.media
    ]


# -------------------------------------------------
# GET all incidents (with media)
# GET /api/v1/incidents
# -------------------------------------------------
@incidents_bp.route("/", methods=["GET"])
@jwt_required(optional=True)
def get_all_incidents():
    incidents = Incident.query.all()
    data = []

    for inc in incidents:
        media_list = format_media_list(inc)
        data.append({
            "id": inc.id,
            "title": inc.title,
            "description": inc.description,
            "latitude": inc.latitude,
            "longitude": inc.longitude,
            "status": inc.status,
            "created_by": inc.created_by,
            "created_at": inc.created_at,
            "updated_at": inc.updated_at,
            "media": media_list
        })

    return jsonify(data), 200


# -------------------------------------------------
# GET single incident by ID (with media)
# GET /api/v1/incidents/<id>
# -------------------------------------------------
@incidents_bp.route("/<int:incident_id>", methods=["GET"])
@jwt_required(optional=True)
def get_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    media_list = format_media_list(incident)

    response = {
        "id": incident.id,
        "title": incident.title,
        "description": incident.description,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "status": incident.status,
        "created_by": incident.created_by,
        "created_at": incident.created_at,
        "updated_at": incident.updated_at,
        "media": media_list
    }
    return jsonify(response), 200


# -------------------------------------------------
# CREATE a new incident
# POST /api/v1/incidents
# -------------------------------------------------
@incidents_bp.route("/", methods=["POST"])
@jwt_required()
def create_incident():
    data = request.get_json()
    user_id = int(get_jwt_identity())  # ✅ ensure it's int

    new_incident = Incident(
        title=data.get("title"),
        description=data.get("description"),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        created_by=user_id
    )
    db.session.add(new_incident)
    db.session.commit()

    return jsonify({
        "msg": "Incident created",
        "incident_id": new_incident.id
    }), 201


# -------------------------------------------------
# UPDATE incident
# PUT /api/v1/incidents/<id>
# -------------------------------------------------
@incidents_bp.route("/<int:incident_id>", methods=["PUT"])
@jwt_required()
def update_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    user_id = int(get_jwt_identity())  # ✅ cast to int

    # Authorization check
    if incident.created_by != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json()
    incident.title = data.get("title", incident.title)
    incident.description = data.get("description", incident.description)
    incident.latitude = data.get("latitude", incident.latitude)
    incident.longitude = data.get("longitude", incident.longitude)
    incident.status = data.get("status", incident.status)

    db.session.commit()
    return jsonify({"msg": "Incident updated"}), 200


# -------------------------------------------------
# DELETE incident
# DELETE /api/v1/incidents/<id>
# -------------------------------------------------
@incidents_bp.route("/<int:incident_id>", methods=["DELETE"])
@jwt_required()
def delete_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    user_id = int(get_jwt_identity())  # ✅ cast to int

    # Creator OR admin can delete
    if incident.created_by != user_id and user.role != "admin":
        return jsonify({"msg": "Unauthorized"}), 403

    db.session.delete(incident)
    db.session.commit()
    return jsonify({"msg": "Incident deleted"}), 200



# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from app.extensions import db
# from app.models import Incident, Comment, Media, User

# incidents_bp = Blueprint("incidents", __name__, url_prefix="/api/v1/incidents", strict_slashes=False)

# ALLOWED_STATUSES = ["pending", "in-progress", "resolved", "rejected"]

# # ------------------------
# # Create a new incident
# # ------------------------
# @incidents_bp.route("/", methods=["POST"])
# @jwt_required()
# def create_incident():
#     data = request.get_json()
#     current_user_id = get_jwt_identity()

#     if not data or not all(k in data for k in ("title", "description", "latitude", "longitude")):
#         return jsonify({"msg": "Missing required fields"}), 400

#     incident = Incident(
#         title=data["title"],
#         description=data["description"],
#         latitude=data["latitude"],
#         longitude=data["longitude"],
#         status="pending",
#         created_by=current_user_id
#     )
#     db.session.add(incident)
#     db.session.commit()

#     return jsonify({"msg": "Incident created", "id": incident.id}), 201


# # ------------------------
# # Get all incidents
# # ------------------------
# @incidents_bp.route("/", methods=["GET"])
# def get_incidents():
#     incidents = Incident.query.all()
#     return jsonify([
#         {
#             "id": i.id,
#             "title": i.title,
#             "description": i.description,
#             "latitude": i.latitude,
#             "longitude": i.longitude,
#             "status": i.status,
#             "created_by": i.created_by
#         } for i in incidents
#     ])


# # ------------------------
# # Get a single incident by ID
# # ------------------------
# @incidents_bp.route("/<int:incident_id>", methods=["GET"])
# def get_incident(incident_id):
#     incident = Incident.query.get_or_404(incident_id)
#     return jsonify({
#         "id": incident.id,
#         "title": incident.title,
#         "description": incident.description,
#         "latitude": incident.latitude,
#         "longitude": incident.longitude,
#         "status": incident.status,
#         "created_by": incident.created_by
#     })


# # ------------------------
# # Get incidents belonging to the logged-in user
# # ------------------------
# @incidents_bp.route("/mine", methods=["GET"])
# @jwt_required()
# def my_incidents():
#     user_id = get_jwt_identity()
#     incidents = Incident.query.filter_by(created_by=user_id).all()
#     return jsonify([
#         {
#             "id": i.id,
#             "title": i.title,
#             "description": i.description,
#             "status": i.status,
#             "created_by": i.created_by
#         } for i in incidents
#     ])


# # ------------------------
# # Update an incident
# # ------------------------
# @incidents_bp.route("/<int:incident_id>", methods=["PUT"])
# @jwt_required()
# def update_incident(incident_id):
#     data = request.get_json()
#     current_user_id = get_jwt_identity()
#     incident = Incident.query.get_or_404(incident_id)

#     user = User.query.get(current_user_id)
#     if incident.created_by != current_user_id and user.role != "admin":
#         return jsonify({"msg": "Not authorized"}), 403

#     # Update only provided fields
#     if "title" in data:
#         incident.title = data["title"]
#     if "description" in data:
#         incident.description = data["description"]
#     if "latitude" in data:
#         incident.latitude = data["latitude"]
#     if "longitude" in data:
#         incident.longitude = data["longitude"]
#     if "status" in data:
#         new_status = data["status"]
#         if new_status not in ALLOWED_STATUSES:
#             return jsonify({"msg": f"Invalid status. Allowed: {ALLOWED_STATUSES}"}), 400

#         # Award points if status moves to resolved
#         if new_status == "resolved" and incident.status != "resolved":
#             incident_user = User.query.get(incident.created_by)
#             incident_user.points += 5

#         incident.status = new_status

#     db.session.commit()
#     return jsonify({"msg": "Incident updated"})


# # ------------------------
# # Delete an incident
# # ------------------------
# @incidents_bp.route("/<int:incident_id>", methods=["DELETE"])
# @jwt_required()
# def delete_incident(incident_id):
#     current_user_id = get_jwt_identity()
#     incident = Incident.query.get_or_404(incident_id)

#     user = User.query.get(current_user_id)
#     if incident.created_by != current_user_id and user.role != "admin":
#         return jsonify({"msg": "Not authorized"}), 403

#     db.session.delete(incident)
#     db.session.commit()
#     return jsonify({"msg": "Incident deleted"})


# # ------------------------
# # Add a comment to an incident
# # ------------------------
# @incidents_bp.route("/<int:incident_id>/comments", methods=["POST"])
# @jwt_required()
# def add_comment(incident_id):
#     data = request.get_json()
#     current_user_id = get_jwt_identity()

#     if not data or "text" not in data:
#         return jsonify({"msg": "Missing comment text"}), 400

#     comment = Comment(
#         text=data["text"],
#         incident_id=incident_id,
#         created_by=current_user_id
#     )
#     db.session.add(comment)
#     db.session.commit()

#     return jsonify({"msg": "Comment added", "id": comment.id}), 201


# # ------------------------
# # Upload media to an incident
# # ------------------------
# @incidents_bp.route("/<int:incident_id>/media", methods=["POST"])
# @jwt_required()
# def upload_media(incident_id):
#     if "file" not in request.files:
#         return jsonify({"msg": "No file uploaded"}), 400

#     file = request.files["file"]
#     if file.filename == "":
#         return jsonify({"msg": "Empty filename"}), 400

#     filename = file.filename
#     file_url = f"/uploads/{filename}"

#     current_user_id = get_jwt_identity()
#     media = Media(
#         filename=filename,
#         file_url=file_url,
#         incident_id=incident_id,
#         uploaded_by=current_user_id
#     )
#     db.session.add(media)
#     db.session.commit()

#     return jsonify({"msg": "Media uploaded", "id": media.id, "file_url": file_url}), 201