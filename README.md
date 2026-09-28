# 🏙️ CivicFlow — Smart Civic

### **From “Someone should fix this.” to “It’s being handled.”**

> **CivicFlow** is an intelligent civic complaint management platform that connects **citizens, municipal administrators, AI-powered image verification, analytics, and automated reporting** into one streamlined system.

![CivicFlow Banner](https://placehold.co/1600x500/0f172a/ffffff?text=CivicFlow+%E2%80%94+Smart+Civic)

**Report it. Verify it. Prioritize it. Resolve it.**

---

## ✨ What is CivicFlow?

CivicFlow is a modern **smart-city complaint management system** designed to make reporting and resolving civic issues faster, more transparent, and more data-driven.

Instead of relying on scattered complaints, manual verification, and disconnected municipal workflows, CivicFlow provides a centralized platform where:

**Citizens can**

* 📝 Report civic issues
* 📸 Upload photographic evidence
* 📍 Track complaints
* 🔎 View complaint history
* 📊 Follow status updates
* 🔐 Securely manage their accounts

**Municipal administrators can**

* 📋 Manage the complaint queue
* 🧑‍💼 Assign complaints
* 🔄 Update complaint status
* 📊 Monitor civic trends
* 📈 Analyze complaint patterns
* 📄 Generate municipal reports

And behind the scenes, **AI helps verify uploaded images and automatically determine the appropriate complaint category.**

---

# 🚀 Why CivicFlow?

Traditional civic complaint systems often treat every complaint as a simple ticket.

CivicFlow treats a complaint as **structured civic intelligence**.

```text
Citizen
   │
   ▼
📸 Evidence
   │
   ▼
🤖 AI Image Verification
   │
   ▼
🏷️ Automatic Categorization
   │
   ▼
⚡ Priority Calculation
   │
   ▼
📋 Municipal Queue
   │
   ▼
👨‍💼 Administrative Action
   │
   ▼
🔄 Status Tracking
   │
   ▼
📊 Analytics
   │
   ▼
📄 Municipal Report
```

The result is a complete lifecycle rather than just a complaint form.

---

# 🧠 Intelligent Complaint Processing

One of CivicFlow's core features is its **AI-assisted image verification pipeline**.

When a citizen uploads an image, CivicFlow can analyze it using a YOLO-based verification model.

Currently supported civic issue categories include:

| Category        | Example                                      |
| --------------- | -------------------------------------------- |
| 🕳️ Pothole     | Damaged or uneven road surface               |
| 🛣️ Road Damage | Cracks, broken roads, damaged infrastructure |
| 🗑️ Garbage     | Garbage accumulation or waste dumping        |

The system can use the verification result to assist with **automatic complaint categorization**.

This reduces the amount of manual classification required from administrators.

---

# ⚡ Smart Priority

Not every complaint requires the same urgency.

CivicFlow calculates a **backend-generated priority score** using complaint information and system logic.

This allows administrators to distinguish between:

```text
LOW PRIORITY
      ↓
NORMAL
      ↓
HIGH PRIORITY
      ↓
CRITICAL
```

The important part:

> **Priority is calculated by the backend rather than being trusted entirely to the frontend.**

This keeps the business logic centralized and makes the system harder to manipulate from the client side.

---

# 👥 Two Perspectives. One Platform.

## 👤 Citizen Experience

Citizens get a dedicated workflow focused on simplicity.

### Dashboard

A centralized overview of their civic activity.

### Report an Issue

Submit:

* Issue details
* Category
* Photo evidence
* Relevant information

### Complaint Tracking

Citizens can view:

* Complaint details
* Current status
* Status timeline
* Priority
* Complaint history

### Complaint History

Every user's complaints remain accessible from their account.

---

# 🏛️ Administrator Experience

Administrators get a completely different operational interface.

### Complaint Queue

View incoming complaints in one place.

### Complaint Inspection

Open individual complaints and inspect:

* Citizen information
* Description
* Uploaded evidence
* Category
* Priority
* Current status
* Status history

### Assignment

Administrators can assign complaints for municipal handling.

### Status Management

Move complaints through their lifecycle:

```text
Submitted
   ↓
Under Review
   ↓
Assigned
   ↓
In Progress
   ↓
Resolved
```

---

# 📊 Analytics Dashboard

CivicFlow doesn't stop at individual complaints.

The analytics layer helps administrators understand **what is happening across the civic system**.

Potential insights include:

* Total complaints
* Complaint distribution
* Category breakdown
* Status distribution
* Priority distribution
* Operational trends

This turns raw complaints into information that can support municipal decision-making.

---

# 🤖 Gemini-Powered Reports

CivicFlow can generate municipal reports using **Google Gemini**.

### Report Pipeline

```text
Complaint Data
      ↓
Analytics
      ↓
Gemini
      ↓
Municipal Report
      ↓
PDF
```

Instead of manually compiling complaint statistics, administrators can generate a structured report from the collected system data.

---

# 🔐 Authentication & Authorization

CivicFlow supports multiple authentication methods:

### Email & Password

Standard account registration and login.

### Google Authentication

Google OAuth integration for streamlined authentication.

### Role-Based Access

Users are separated into:

```text
👤 CITIZEN
   └── Citizen Dashboard
   └── Submit Complaints
   └── Track Complaints
   └── View History

🏛️ ADMIN
   └── Complaint Management
   └── Assignment
   └── Status Control
   └── Analytics
   └── Report Generation
```

Authentication is handled through the FastAPI backend using JWT-based authorization.

---

# 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      CITIZEN         │
                    │  React + Vite UI     │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │      FASTAPI         │
                    │      Backend         │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐     ┌────────────┐    ┌────────────┐
       │ MongoDB   │     │ Cloudinary │    │   Gemini   │
       │ Database  │     │   Images   │    │ AI Reports │
       └───────────┘     └────────────┘    └────────────┘
                               │
                               ▼
                       ┌──────────────┐
                       │ YOLO Model   │
                       │ Verification │
                       └──────────────┘
```

---

# 🛠️ Tech Stack

### Frontend

| Technology  | Purpose               |
| ----------- | --------------------- |
| ⚛️ React    | UI development        |
| ⚡ Vite      | Frontend tooling      |
| 🌐 REST API | Backend communication |

### Backend

| Technology  | Purpose            |
| ----------- | ------------------ |
| 🐍 FastAPI  | REST API           |
| 🔐 JWT      | Authentication     |
| 🗄️ MongoDB | Data storage       |
| 📚 Pydantic | Data validation    |
| 🤖 YOLO     | Image verification |

### Cloud & AI

| Technology      | Purpose                     |
| --------------- | --------------------------- |
| ☁️ Cloudinary   | Image storage               |
| ✨ Google Gemini | Municipal report generation |
| 🤗 Hugging Face | Model distribution          |

### Development

| Technology         | Purpose                   |
| ------------------ | ------------------------- |
| 🐳 Docker          | Local MongoDB environment |
| 📖 Swagger/OpenAPI | API documentation         |

---

# 📁 Project Structure

```text
civicflow-smart-civic/
│
├── smart-civic-backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── ...
│
├── smart-civic-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.*
│   └── .env
│
├── docker-compose.yml
└── README.md
```

---

# 🔌 API Overview

CivicFlow exposes a RESTful API through FastAPI.

## 🔐 Authentication

| Method | Endpoint             | Purpose               |
| ------ | -------------------- | --------------------- |
| `POST` | `/api/auth/register` | Register user         |
| `POST` | `/api/auth/login`    | Login                 |
| `POST` | `/api/auth/google`   | Google authentication |
| `GET`  | `/api/auth/me`       | Get current user      |

---

## 📝 Complaints

| Method  | Endpoint                           | Purpose                     |
| ------- | ---------------------------------- | --------------------------- |
| `GET`   | `/api/complaints`                  | Retrieve complaints         |
| `POST`  | `/api/complaints`                  | Create complaint            |
| `PATCH` | `/api/complaints/{complaint_id}`   | Update complaint            |
| `POST`  | `/api/complaints/verify-image`     | Verify uploaded image       |
| `GET`   | `/api/complaints/priority-preview` | Preview calculated priority |

---

## 📊 Analytics & Reports

| Method | Endpoint                | Purpose                   |
| ------ | ----------------------- | ------------------------- |
| `GET`  | `/api/analytics/report` | Retrieve analytics        |
| `POST` | `/api/reports/generate` | Generate municipal report |

---

# 🖥️ Frontend Routes

```text
/login
```

Authentication.

```text
/citizen
```

Citizen dashboard.

```text
/citizen/report
```

Complaint submission.

```text
/citizen/complaints
```

Complaint history and tracking.

```text
/admin
```

Administrator dashboard.

```text
/admin/complaints
```

Complaint management.

```text
/admin/analytics
```

Analytics dashboard.

---

# ⚙️ Getting Started

## 1️⃣ Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/civicflow-smart-civic.git

cd civicflow-smart-civic
```

---

# 🐍 Backend Setup

Navigate to the backend:

```bash
cd smart-civic-backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create:

```text
smart-civic-backend/.env
```

Add:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=smart_civic_db

JWT_SECRET_KEY=change_this_to_a_long_random_secret

GOOGLE_CLIENT_ID=<google_oauth_client_id>

CLOUDINARY_CLOUD_NAME=<cloudinary_cloud_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_API_SECRET=<cloudinary_api_secret>

GEMINI_API_KEY=<gemini_api_key>
GEMINI_MODEL=gemini-2.5-flash
```

Start FastAPI:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

API:

```text
http://localhost:8000/api
```

---

# ⚛️ Frontend Setup

Open another terminal:

```bash
cd smart-civic-frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
smart-civic-frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=<google_oauth_client_id>
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🐳 MongoDB with Docker

If you don't already have MongoDB running locally:

```bash
docker compose up -d mongodb
```

CivicFlow will use:

```text
MongoDB
localhost:27017

Database
smart_civic_db
```

### Development fallback

If MongoDB is unavailable, the backend can fall back to **in-memory mode**.

⚠️ Data stored in this mode is temporary and will disappear when the backend restarts.

---

# 📸 Image Verification Pipeline

CivicFlow's image verification works approximately like this:

```text
        📷 Upload Image
              │
              ▼
       Image Validation
              │
              ▼
       Image Preprocessing
              │
              ▼
          YOLO Model
              │
              ▼
      Object Verification
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
    Pothole  Road   Garbage
             Damage
              │
              ▼
      Category Selection
              │
              ▼
       Priority Calculation
```

The model is downloaded from Hugging Face when image verification is used for the first time.

For safety and performance:

* Uploaded images above **5 MB are rejected**
* Large images are resized before YOLO inference

---

# 🔄 Complete CivicFlow Lifecycle

```text
┌───────────────────┐
│ Citizen registers │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Report civic issue│
│ + upload photo    │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ AI image          │
│ verification      │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Category +         │
│ priority generated │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Admin reviews     │
│ complaint         │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Assignment        │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Issue resolution  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Citizen tracks    │
│ status            │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Analytics +       │
│ municipal reports │
└───────────────────┘
```

---

# 🧩 Design Philosophy

CivicFlow is built around four principles:

### 01 — Accessibility

Civic technology should be understandable to ordinary citizens.

### 02 — Transparency

Citizens should be able to see what is happening with their complaints.

### 03 — Automation

Repetitive administrative tasks should be assisted by software and AI.

### 04 — Data-Driven Governance

Municipal teams should be able to understand complaint patterns rather than simply process individual tickets.

---

# 🔒 Security Notes

**Never commit secrets to Git.**

Do not commit:

```text
.env
API keys
JWT secrets
Cloudinary credentials
Google OAuth credentials
Gemini API keys
```

Add `.env` to `.gitignore`:

```gitignore
.env
.env.*
!.env.example
```

For production deployments, replace development secrets with securely managed environment variables.

---

# 🧪 Development

### Backend

```bash
cd smart-civic-backend

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd smart-civic-frontend

npm run dev
```

### MongoDB

```bash
docker compose up -d mongodb
```

---

# 🗺️ Roadmap

CivicFlow is designed to grow beyond a basic complaint portal.

Potential future improvements include:

* [ ] 📍 GPS-based complaint location
* [ ] 🗺️ Interactive civic issue map
* [ ] 🔔 Real-time notifications
* [ ] 📱 Progressive Web App
* [ ] 🧠 More AI-verified issue categories
* [ ] 🌐 Multi-language citizen interface
* [ ] ♿ Enhanced accessibility features
* [ ] 📈 Predictive complaint analytics
* [ ] 🏙️ Ward-level analytics
* [ ] 📊 Municipal performance dashboards
* [ ] 🔗 Public transparency portal
* [ ] 📱 Native mobile application

---

# 🌐 The Bigger Idea

A civic complaint shouldn't disappear into a database.

It should become part of a visible, traceable workflow:

> **A citizen notices a problem → reports it → evidence is verified → the issue is prioritized → an administrator acts → the citizen follows the progress → the city learns from the data.**

That's the idea behind **CivicFlow**.

---

# 👨‍💻 Built With

**React · Vite · FastAPI · Python · MongoDB · JWT · YOLO · Cloudinary · Google Gemini · Docker · Hugging Face**

---

# ⭐ Support the Project

If CivicFlow helped you, inspired you, or you simply like the idea of smarter civic infrastructure:

**⭐ Star the repository**

**🍴 Fork it**

**🐛 Open an issue**

**💡 Contribute an improvement**

---

## 📜 License

Add your chosen open-source license here.

---

<div align="center">

### 🏙️ CivicFlow

**Making civic problems visible, actionable, and trackable.**

`Report → Verify → Prioritize → Resolve → Learn`

</div>
