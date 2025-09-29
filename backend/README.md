# 🌐 Ajali API Documentation

**Base URL:**  
```
https://sdf-pt10-group-09.onrender.com
```

---

## 🔑 Authentication

### 1. User Signup
**POST**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/auth/signup
```
**Body (JSON):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

### 2. User Login
**POST**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/auth/login
```
**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
**Returns:** JWT token.

### 3. Get Current User (Profile)
**GET**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/auth/me
```
**Headers:**
```
Authorization: Bearer <token>
```

### 4. Promote User to Admin
**PATCH** (admin-only)  
```
https://sdf-pt10-group-09.onrender.com/api/v1/auth/promote/<user_id>
```
**Headers:**
```
Authorization: Bearer <admin_token>
```

---

## 👤 User Management

### 5. Get All Users (Admin Only)
**GET**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/users
```

### 6. Get Single User  
**GET**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/users/<user_id>
```

### 7. Update User Profile  
**PATCH**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/users/<user_id>
```

### 8. Delete User (Admin Only)  
**DELETE**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/users/<user_id>
```

---

## 🚨 Incident Reports

### 9. Create Incident
**POST**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/incidents
```
**Body (JSON):**
```json
{
  "title": "Road Accident",
  "description": "Two cars collided on Mombasa Road",
  "location": "Nairobi",
  "media_url": "https://example.com/image.jpg"
}
```

### 10. Get All Incidents  
**GET**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/incidents
```

### 11. Get Single Incident  
**GET**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/incidents/<incident_id>
```

### 12. Update Incident  
**PATCH**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/incidents/<incident_id>
```

### 13. Delete Incident  
**DELETE**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/incidents/<incident_id>
```

### 14. Update Incident Status (Admin Only)
**PATCH**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/incidents/<incident_id>/status
```
**Body (JSON):**
```json
{
  "status": "approved"
}
```
**Acceptable statuses:**
- `pending`
- `in_progress`
- `approved`
- `rejected`

---

## 🖼️ Media

### 15. Upload Media to Incident
**POST**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/media/upload
```
**Form Data:**
- `file`: image/video file
- `incident_id`: associated incident

---

## 💬 Comments

### 16. Add Comment to Incident  
**POST**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/incidents/<incident_id>/comments
```
**Body (JSON):**
```json
{
  "text": "This incident has been reported to the police"
}
```

### 17. Get Comments for Incident  
**GET**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/incidents/<incident_id>/comments
```

---

## 🏆 Points System

### 18. Award Points on Approved Incident  
**PATCH**  
```
https://sdf-pt10-group-09.onrender.com/api/v1/incidents/<incident_id>/award-points
```
**Behavior:**  
- When an incident is marked as `approved`, the user who submitted it automatically receives **+5 points**.  

**Response Example:**
```json
{
  "message": "Incident approved. User awarded 5 points.",
  "user_points": 25
}
```
