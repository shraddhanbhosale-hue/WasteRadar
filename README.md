# WasteRadar 🗑️

**Spot Waste. Report It. Get It Cleaned.**

WasteRadar is an AI-powered waste reporting and management platform that connects citizens with local authorities for faster and more organized roadside waste collection.

## 🚀 Features

* 📸 Upload roadside waste images
* 🤖 AI-based waste detection and classification
* 📍 GPS-based waste location reporting
* 👤 Citizen, Admin and Driver roles
* 🚛 Vehicle and driver management
* 📋 Waste report tracking
* 📊 Admin dashboard and analytics
* 🔄 Complete collection workflow
* 🌍 Multi-village support

## 🧠 AI

WasteRadar uses a separate FastAPI AI service with a custom YOLOv11 object detection model through Roboflow.

The AI can detect waste such as:

* Plastic
* Paper
* Organic
* Aluminum cans
* Cardboard
* Glass bottles
* Plastic bottles
* Plastic cups
* Tin
* Other waste

It also provides:

* Detection confidence
* Waste type
* Severity estimation

## 🏗️ Tech Stack

**Frontend**

* React
* Vite
* Tailwind CSS
* Axios
* React Router
* Leaflet / OpenStreetMap
* Recharts

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer

**AI**

* Python
* FastAPI
* YOLOv11
* Roboflow
* OpenCV

**Deployment**

* MongoDB Atlas
* Render
* Vercel

## 🔄 Workflow

```text
Citizen
   ↓
Upload Waste Image
   ↓
AI Detection
   ↓
GPS Location
   ↓
Admin Review
   ↓
Vehicle & Driver Assignment
   ↓
Waste Collection
   ↓
Resolved
```

## 📋 Report Status

```text
REPORTED
    ↓
AI_VERIFIED
    ↓
ADMIN_REVIEW
    ↓
VEHICLE_ASSIGNED
    ↓
IN_PROGRESS
    ↓
RESOLVED
```

Reports can also be marked as **REJECTED** or **DUPLICATE**.

## 📁 Project Structure

```text
WasteRadar/
├── frontend/
├── backend/
├── ai-service/
└── README.md
```

## ⚙️ Local Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8002
```

## 🔐 Environment Variables

Sensitive configuration is stored in `.env` files and should **never be committed to GitHub**.

Required configuration includes:

* MongoDB connection string
* JWT secret
* Roboflow API key
* Google OAuth credentials
* AI service URL

## 🎯 Future Improvements

* Smart duplicate detection
* Waste hotspot heatmaps
* Route optimization
* Automatic authority routing
* Push notifications
* AI-based waste volume estimation
* Predictive waste hotspot analysis

## 👩‍💻 Author

**Shraddha Bhosale**

Computer Engineering Student
Pravara Rural Engineering College, Loni

---

### 🌱 Spot Waste. Report It. Get It Cleaned.
