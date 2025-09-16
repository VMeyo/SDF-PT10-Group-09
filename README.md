# 🚨 Ajali! – Citizen-Driven Emergency Reporting System

Ajali! is a citizen-driven emergency reporting system for Kenya that enables users to **report accidents and emergencies**, **view incidents on an interactive map**, and **receive real-time updates**.

---

## 🛠️ Tech & License

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![React 18.2.0](https://img.shields.io/badge/React-18.2.0-61dafb) ![Flask 2.3.3](https://img.shields.io/badge/Flask-2.3.3-green) ![PostgreSQL 16.2](https://img.shields.io/badge/PostgreSQL-16.2-336791)

## 🌟 Features

- 🗺️ **Interactive Map** – View reported incidents with real-time location data  
- 📱 **Responsive Design** – Accessible on both mobile and desktop devices  
- 🔐 **Secure Authentication** – JWT-based user authentication system  
- ⚡ **Real-time Updates** – Get instant notifications about emergency situations  
- 📊 **Incident Management** – Report, view, and track emergency incidents  
- 🎯 **Location Services** – Precise geolocation tagging for accurate reporting  

## 🛠️ Tech Stack

### 🔹 Frontend
- ⚛️ **React 18** – User interface library  
- ⚡ **Vite** – Build tool and development server  
- 🗺️ **Leaflet / OpenStreetMap** – Mapping and geolocation services  
- 🌐 **Axios** – HTTP client for API requests  

### 🔹 Backend
- 🐍 **Flask** – Python web framework  
- 🗄️ **SQLAlchemy** – ORM for database management  
- 🐘 **PostgreSQL** – Relational database  
- 🔐 **JWT** – JSON Web Token authentication  
- 🐍 **Python 3.11** – Backend runtime  

## 🚀 Deployment

- **Render** – Backend hosting platform: [https://sdf-pt10-group-09.onrender.com/](https://sdf-pt10-group-09.onrender.com/)  
- **Netlify** – Frontend hosting platform (planned)

## 🌍 Project Links

- **Frontend (Development):** #[http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- **Fronted vercel link:** sdf-pt-10-group-09-81kn-hdiy3ly3g-victor-meyos-projects.vercel.app
- **Backend (Production):** [https://sdf-pt10-group-09.onrender.com/](https://sdf-pt10-group-09.onrender.com/)  
- **GitHub Repository:** [https://github.com/VMeyo/SDF-PT10-Group-09](https://github.com/VMeyo/SDF-PT10-Group-09)

## 🚀 Getting Started

### Prerequisites
Before running Ajali locally, make sure you have the following installed:

- 🟢 **Node.js** (v16 or higher)  
- 🐍 **Python 3.11+**  
- 🐘 **PostgreSQL** (v12 or higher)  
- 🔧 **Git**

## 💻 Installation

Clone the repository and navigate into the project folder:

```bash
git clone git@github.com:VMeyo/SDF-PT10-Group-09.git
cd SDF-PT10-Group-09
```
## ⚙️ Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```
### Install Dependencies

```bash
npm install
```
### Start Development Server

```bash
npm run dev
```
## ⚙️ Backend Setup

### Navigate to Backend Directory

```bash
cd backend
```

### Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
### Install Dependencies

```bash
pip install -r requirements.txt
```

### Set Up Environment Variables

```bash
cp .env.example .env
```
Then update .env with your settings:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/ajali_db
JWT_SECRET_KEY=your_super_secret_jwt_key
FLASK_ENV=development
```

### Initialize the Database

```bash
flask db init
flask db migrate
flask db upgrade
```

### Start the Development Server

```bash
flask run
```

## 📡 API Endpoints

### 1️⃣ Authentication (JWT)

| Method | Endpoint                        | Access | Description |
|--------|---------------------------------|--------|-------------|
| POST   | `/api/v1/auth/signup`           | Public | Register a new user (name, email, password, phone) |
| POST   | `/api/v1/auth/login`            | Public | Log in, return JWT token |
| GET    | `/api/v1/auth/me`               | Auth   | Get current logged-in user info (id, name, email, role, points) |
| POST   | `/api/v1/auth/refresh`          | Auth   | Refresh JWT token |
| POST   | `/api/v1/auth/password-reset-request` | Public | Request password reset email |
| POST   | `/api/v1/auth/password-reset`   | Public | Reset password using token sent via email |

---

### 2️⃣ Incident Reports

| Method | Endpoint                        | Access | Description |
|--------|---------------------------------|--------|-------------|
| POST   | `/api/v1/incidents`             | Auth   | Create a new incident (title, description, lat/lng) |
| GET    | `/api/v1/incidents`             | Public | List all incidents (filter by status/location optional) |
| GET    | `/api/v1/incidents/<id>`        | Public | Get single incident details including media, comments, status |
| GET    | `/api/v1/incidents/mine`        | Auth   | List incidents reported by the logged-in user |
| PUT    | `/api/v1/incidents/<id>`        | Owner  | Update incident (only creator) |
| DELETE | `/api/v1/incidents/<id>`        | Owner/Admin | Delete incident |
| GET    | `/api/v1/incidents/nearby?lat=...&lng=...&radius=...` | Public | List incidents near a location |

---

### 3️⃣ Media Uploads (Images/Videos)

| Method | Endpoint                        | Access     | Description |
|--------|---------------------------------|------------|-------------|
| POST   | `/api/v1/incidents/<id>/media`  | Owner/Admin | Upload media (image/video) for an incident |
| DELETE | `/api/v1/media/<id>`            | Owner/Admin | Delete uploaded media |

---

### 4️⃣ Comments

| Method | Endpoint                        | Access | Description |
|--------|---------------------------------|--------|-------------|
| POST   | `/api/v1/incidents/<id>/comments` | Auth   | Add a comment to an incident |
| GET    | `/api/v1/incidents/<id>/comments` | Public | List all comments for an incident |

---

### 5️⃣ Admin Actions (Status Updates)

| Method | Endpoint                                  | Access | Description |
|--------|-------------------------------------------|--------|-------------|
| GET    | `/api/v1/admin/incidents`                | Admin  | List all incidents (with optional filters) |
| PATCH  | `/api/v1/admin/incidents/<id>/status`   | Admin  | Update incident status (investigating, resolved, rejected). Triggers email to reporter; optional SMS |

---

### 6️⃣ Points & Rewards (Optional / Gamification)

| Method | Endpoint                     | Access | Description |
|--------|------------------------------|--------|-------------|
| GET    | `/api/v1/users/points`       | Auth   | View current points balance |
| POST   | `/api/v1/users/redeem`       | Auth   | Redeem points for rewards (e.g., airtime, coupons) |
| GET    | `/api/v1/users/leaderboard`  | Public | Show top reporters by points |

## 🤝 Contributing

We welcome contributions to **Ajali!** Please follow these steps:

1. **Fork the project**  
2. **Create a feature branch**  
```bash
git checkout -b feature/AmazingFeature
```

3. Commit Your Changes

```bash
git commit -m "Add some AmazingFeature"
```

4. Push to the Branch

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

Open a Pull Request on the main repository to merge your feature branch into `main`.

---

This is **all-in-one** and ready to use in your repository.






## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
