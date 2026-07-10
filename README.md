<p align="center">
  <img src="https://img.shields.io/badge/AI-YOLOv8-00D4AA?style=for-the-badge&logo=pytorch&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

# 🛡️ GuardianAI — Intelligent Poaching Detection & Response System

An AI-powered wildlife surveillance platform that uses **YOLOv8 deep learning** to detect poachers, weapons, rangers, and animals in field images. The system provides **real-time threat alerts**, **automated email notifications**, and a **role-based command center** for officers and rangers.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Role-Based Access Control](#-role-based-access-control)
- [Detection Classes](#-detection-classes)
- [Email Alert System](#-email-alert-system)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **AI-Powered Detection** | YOLOv8 model trained on wildlife/poaching datasets for real-time object detection |
| 📸 **Batch Image Upload** | Upload up to 20 surveillance images at once with drag-and-drop |
| ⚠️ **Critical Threat Alerts** | Automatic alert generation when poachers or weapons are detected |
| 📧 **Email Notifications** | Automated Gmail alerts sent to officers with detection details and frame attachments |
| 👮 **Officer Dashboard** | Dedicated command center for officers to monitor, resolve, and manage alerts |
| 🧑‍🌾 **Ranger Dashboard** | Field dashboard with upload capabilities, detection results, and threat statistics |
| 🔐 **Role-Based Access (RBAC)** | JWT authentication with `admin`, `ranger`, and `officer` roles |
| 📊 **Detection Analytics** | Visual statistics, threat timelines, and confidence scoring |
| 🎯 **4-Class Detection** | Strictly maps all detections to: `poacher`, `weapon`, `ranger`, `animal` |
| 🔄 **Real-Time Polling** | Auto-refreshing dashboards with live status updates |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.10+** | Core language |
| **FastAPI** | High-performance async API framework |
| **Uvicorn** | ASGI server |
| **MongoDB + Motor** | NoSQL database with async driver |
| **YOLOv8 (Ultralytics)** | Deep learning object detection |
| **OpenCV** | Image processing & frame extraction |
| **bcrypt** | Password hashing |
| **python-jose** | JWT token generation & validation |
| **aiosmtplib** | Async email dispatch |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **TailwindCSS** | Utility-first styling |
| **Framer Motion** | Animations |
| **Recharts** | Data visualization |
| **Lucide React** | Icon library |

---

## 🏗️ System Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌──────────────┐
│   React Frontend    │────▶│   FastAPI Backend    │────▶│   MongoDB    │
│   (Vite + Tailwind) │◀────│   (Uvicorn ASGI)     │◀────│   Database   │
└─────────────────────┘     └──────────┬──────────┘     └──────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   YOLOv8 Model      │
                            │   (Object Detection) │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   Email Service     │
                            │   (Gmail SMTP)      │
                            └─────────────────────┘
```

**Flow:**
1. Ranger uploads surveillance images via the frontend
2. Backend saves the image and queues YOLOv8 inference as a background task
3. YOLOv8 detects objects and maps them to 4 domain classes
4. If `poacher` or `weapon` is detected → alert is created + email sent to officer
5. Officer views alerts on their dedicated dashboard and can mark them as resolved

---

## 📁 Project Structure

```
Intelligent-Poaching-Detection-and-Response-System/
├── backend/
│   ├── api/
│   │   ├── deps.py                # Auth dependencies & role checker
│   │   └── v1/
│   │       ├── api.py             # API router aggregation
│   │       └── endpoints/
│   │           ├── auth.py        # Login & token generation
│   │           ├── users.py       # User registration & profile
│   │           ├── video.py       # Image upload & listing
│   │           ├── alerts.py      # Alert CRUD operations
│   │           └── detections.py  # Detection data endpoints
│   ├── core/
│   │   ├── config.py              # Settings & environment variables
│   │   └── security.py            # JWT & password hashing utilities
│   ├── db/
│   │   └── mongodb.py             # MongoDB connection manager
│   ├── models/
│   │   └── best.pt                # Trained YOLOv8 model weights
│   ├── schemas/
│   │   ├── alert.py               # Alert Pydantic models
│   │   ├── detection.py           # Detection Pydantic models
│   │   ├── token.py               # JWT token schemas
│   │   ├── user.py                # User schemas
│   │   └── video.py               # Video/Image schemas
│   ├── services/
│   │   ├── detection_service.py   # YOLOv8 inference pipeline
│   │   └── email_service.py       # Gmail SMTP alert service
│   ├── static/                    # Uploaded images & detection frames
│   ├── .env.example               # Environment variable template
│   ├── main.py                    # FastAPI application entry point
│   └── requirements.txt           # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js           # Axios instance with interceptors
│   │   │   └── services.js        # Centralized API service layer
│   │   ├── components/
│   │   │   ├── common/            # Reusable UI components
│   │   │   └── layout/            # AppLayout, Sidebar, Header
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication state management
│   │   ├── hooks/
│   │   │   └── useVideos.js       # Video data fetching hook
│   │   └── pages/
│   │       ├── Landing.jsx        # Public landing page
│   │       ├── Login.jsx          # Authentication page
│   │       ├── Register.jsx       # User registration
│   │       ├── Dashboard.jsx      # Ranger command center
│   │       ├── OfficerDashboard.jsx # Officer alert management
│   │       ├── UploadVideo.jsx    # Batch image upload
│   │       ├── DetectionResults.jsx # AI detection viewer
│   │       ├── AlertsPage.jsx     # Threat dispatch center
│   │       └── SystemSettings.jsx # Configuration & profile
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── run.sh                         # One-command startup script
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- **MongoDB** (local or cloud – e.g., MongoDB Atlas)
- **Gmail Account** with [App Password](https://support.google.com/accounts/answer/185833) for email alerts

### 1. Clone the Repository

```bash
git clone https://github.com/Gajanan9960/Intelligent-Poaching-Detection-and-Response-System.git
cd Intelligent-Poaching-Detection-and-Response-System
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate    # macOS/Linux
# venv\Scripts\activate     # Windows

# Install Python dependencies
pip install -r backend/requirements.txt

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your actual values (see Environment Variables section)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

### 4. Add Your YOLOv8 Model

Place your trained YOLOv8 model weights at:
```
backend/models/best.pt
```
> If no custom model is found, the system falls back to `yolov8n.pt` (general pretrained model).

### 5. Start the Application

```bash
# One-command startup (recommended)
chmod +x run.sh
./run.sh
```

This starts both servers:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs

---

## 🔑 Environment Variables

Create `backend/.env` using the template below:

```env
# Database
MONGO_URI="mongodb://localhost:27017"
DATABASE_NAME="poaching_detection_db"

# JWT Authentication
JWT_SECRET="your_super_secret_jwt_key_here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="10080"

# Email Alerts (Gmail SMTP)
EMAIL_ADDRESS="your_email@gmail.com"
EMAIL_APP_PASSWORD="your_gmail_app_password"
OFFICER_EMAIL="officer@example.com"
EMAILS_FROM_EMAIL="alerts@guardian.io"
EMAILS_FROM_NAME="GuardianAI Security"

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://localhost:5174"]
```

---

## 📖 Usage

### Ranger Workflow
1. **Register/Login** at http://localhost:5173/login
2. **Upload Images** — Drag & drop surveillance photos on the Upload page
3. **Start YOLOv8 Scan** — Click once to trigger AI inference
4. **View Results** — Browse detection cards with threat badges and confidence scores
5. **Review Details** — Click any detection for annotated frames and timelines

### Officer Workflow
1. **Login** with officer credentials at http://localhost:5173/login
2. **Officer Dashboard** — View real-time threat statistics and alert table
3. **Active Alerts** — Browse all system-wide alerts from the Threat Dispatch Center
4. **Take Action** — Mark alerts as Resolved or Delete them
5. **Email Notifications** — Receive automated Gmail alerts for critical threats

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/login/access-token` | Public | Login & get JWT token |
| `POST` | `/api/v1/users/` | Public | Register new user |
| `GET` | `/api/v1/users/me` | JWT | Get current user profile |
| `POST` | `/api/v1/video/upload` | Ranger/Admin | Upload image for detection |
| `GET` | `/api/v1/video/list` | JWT | List user's uploaded images |
| `DELETE` | `/api/v1/video/clear` | Ranger/Admin | Clear all user detections |
| `GET` | `/api/v1/detections/` | JWT | Get all detections |
| `GET` | `/api/v1/alerts/` | Officer/Admin | List all alerts |
| `PUT` | `/api/v1/alerts/{id}/resolve` | Officer/Admin | Resolve an alert |

Full interactive documentation: http://localhost:8000/docs

---

## 🔐 Role-Based Access Control

| Role | Permissions |
|---|---|
| **Ranger** | Upload images, view own detections, manage profile |
| **Officer** | View all system alerts, resolve/delete alerts, officer dashboard |
| **Admin** | Full access to all features |

Roles are embedded in JWT tokens and enforced at both API and frontend levels.

---

## 🎯 Detection Classes

The YOLOv8 model output is strictly mapped to 4 domain-specific classes:

| Class | Mapped From | Alert Level |
|---|---|---|
| 🚨 **Poacher** | person, hunter, poacher | **CRITICAL** — triggers email alert |
| 🔫 **Weapon** | gun, rifle, pistol, knife, weapon | **CRITICAL** — triggers email alert |
| 🦁 **Animal** | elephant, tiger, lion, rhino, bear, zebra, etc. | Standard |
| 🛡️ **Ranger** | ranger, guard, vehicle, truck, car | Standard |

Any YOLO class not in the mapping is **dropped** — only these 4 classes are tracked.

---

## 📧 Email Alert System

When a **poacher** or **weapon** is detected:

1. An alert record is created in MongoDB
2. An email is dispatched via **Gmail SMTP** (using App Passwords)
3. The email includes:
   - Detection type and confidence score
   - Timestamp and location context
   - Annotated detection frame as an attachment
4. The officer receives the email and can manage the alert from the dashboard

### Gmail App Password Setup
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Navigate to **App Passwords**
4. Generate a password for "Mail" → "Other (GuardianAI)"
5. Copy the 16-character password to `EMAIL_APP_PASSWORD` in `.env`

---

## 🖼️ Screenshots

> Upload screenshots of the application to the repo and update the paths below.

| Page | Description |
|---|---|
| Landing Page | Public homepage with system overview |
| Ranger Dashboard | Statistics, recent detections, and quick actions |
| Upload Page | Batch image upload with radar scanning animation |
| Detection Results | AI detection cards with threat badges and filters |
| Detection Detail | Annotated frames, bounding boxes, and inference timeline |
| Officer Dashboard | Alert statistics and actionable threat intelligence table |
| Alert Management | Real-time alert dispatch center with resolve/delete actions |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is developed as part of an academic/research initiative for wildlife conservation using AI technology.

---

<p align="center">
  <b>Built with ❤️ for Wildlife Conservation</b><br>
  <sub>Protecting endangered species through intelligent surveillance</sub>
</p>