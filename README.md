# CivicFlow

### Intelligent civic infrastructure, built around the people who use it.

CivicFlow is a full-stack civic issue management platform that turns fragmented citizen complaints into a structured, traceable workflow — from **evidence capture and AI-assisted verification to prioritization, municipal operations, analytics, and reporting.**

It is designed around a simple principle:

> **A civic complaint shouldn't disappear into a ticket queue. It should become an actionable, measurable workflow.**

<br />

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-YOLO%20%2B%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

<p align="center">
  <strong>React · Vite · FastAPI · MongoDB · JWT · YOLO · Cloudinary · Gemini · Docker</strong>
</p>

---

## Product

CivicFlow connects two sides of a civic system.

**Citizens** get a simple way to report problems, provide evidence, and track what happens next.

**Municipal administrators** get an operational system for reviewing, prioritizing, assigning, resolving, analyzing, and reporting those issues.

The result is a single lifecycle:

```text
                    CIVICFLOW

       ┌─────────────────────────────────┐
       │            CITIZEN              │
       │                                 │
       │  Discover → Report → Track      │
       └────────────────┬────────────────┘
                        │
                        ▼
              ┌───────────────────┐
              │   Evidence Layer  │
              │                   │
              │  Image + Details  │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │    AI Pipeline    │
              │                   │
              │  Verify → Classify│
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Priority Engine   │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │  ADMIN OPERATIONS │
              │                   │
              │ Review → Assign   │
              │ Update → Resolve  │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Analytics &       │
              │ Municipal Reports │
              └───────────────────┘
```

---

# Why CivicFlow exists

Most complaint systems stop at:

```text
Submit complaint → Store complaint
```

CivicFlow treats the complaint as the beginning of a workflow:

```text
Submit
   ↓
Understand
   ↓
Verify
   ↓
Categorize
   ↓
Prioritize
   ↓
Assign
   ↓
Resolve
   ↓
Measure
   ↓
Report
```

That distinction drives the architecture.

The frontend is not simply a form.

The backend is not simply CRUD.

The AI layer is not simply an API call.

Each component exists to move the complaint further through its lifecycle.

---

# Core capabilities

<table>
<tr>
<td width="50%">

### Citizen Platform

* Secure registration & authentication
* Google authentication
* Civic issue reporting
* Photo evidence upload
* AI-assisted image verification
* Automatic category selection
* Complaint priority preview
* Complaint history
* Detailed complaint tracking
* Status timeline

</td>
<td width="50%">

### Municipal Platform

* Administrative dashboard
* Complaint queue
* Complaint inspection
* Assignment management
* Status management
* Priority visibility
* Analytics dashboard
* Complaint distribution
* Municipal report generation
* AI-assisted reporting

</td>
</tr>
</table>

---

# The interesting part: AI-assisted verification

One of the central pieces of CivicFlow is the image verification pipeline.

A citizen can submit an image as evidence rather than relying exclusively on a textual description.

The backend processes the image through a YOLO-based verification model capable of assisting with categories such as:

```text
Pothole
Road Damage
Garbage
```

The pipeline looks like this:

```text
                     Uploaded Image
                           │
                           ▼
                  ┌─────────────────┐
                  │ Input Validation│
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Image Resize    │
                  │ & Preprocessing │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   YOLO Model    │
                  │   Inference     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Verification /  │
                  │ Classification  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Complaint       │
                  │ Categorization  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Priority Engine │
                  └─────────────────┘
```

Large images are rejected above **5 MB** and resized before inference to keep processing practical.

The model is downloaded from Hugging Face on first use.

---

# Priority is a backend concern

CivicFlow does not rely on the browser to decide how important a complaint is.

Priority calculation happens on the backend.

That matters because:

```text
Frontend
    │
    │ request
    ▼
Backend
    │
    ├── Validate
    ├── Calculate priority
    ├── Apply business rules
    └── Persist result
          │
          ▼
       Database
```

The client displays the result.

The server owns the decision logic.

This keeps business rules centralized and prevents the frontend from becoming the source of truth.

---

# Architecture

```text
┌───────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                          │
│                                                               │
│                    React + Vite                               │
│                                                               │
│  Login · Citizen Portal · Admin Portal · Analytics            │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               │ REST / JSON
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                         API LAYER                             │
│                                                               │
│                         FastAPI                               │
│                                                               │
│  Authentication · Complaints · Analytics · Reports            │
└──────────────┬────────────────┬────────────────┬──────────────┘
               │                │                │
               ▼                ▼                ▼
        ┌────────────┐   ┌─────────────┐   ┌──────────────┐
        │ MongoDB    │   │ Cloudinary  │   │ AI Services  │
        │            │   │             │   │              │
        │ Users      │   │ Evidence    │   │ YOLO         │
        │ Complaints │   │ Images      │   │ Gemini       │
        │ Analytics  │   │             │   │ Hugging Face │
        └────────────┘   └─────────────┘   └──────────────┘
```

---

# Backend architecture

CivicFlow's backend is structured around clear responsibilities rather than putting application logic directly inside route handlers.

```text
smart-civic-backend/
│
├── main.py
│
├── routes/
│   ├── auth
│   ├── complaints
│   ├── analytics
│   └── reports
│
├── services/
│   ├── authentication
│   ├── image verification
│   ├── priority calculation
│   └── report generation
│
├── models/
│   └── data models
│
├── validation/
│   └── request validation
│
└── ...
```

The exact implementation can evolve independently because responsibilities are separated between API handling, business logic, validation, persistence, and external services.

---

# Authentication

CivicFlow supports:

### Email / Password

Traditional registration and login backed by JWT authentication.

### Google

OAuth-based authentication through Google.

### Role-based access

Two primary roles exist:

```text
CITIZEN
   │
   ├── Create complaints
   ├── View own complaints
   └── Track complaint status


ADMIN
   │
   ├── View complaint queue
   ├── Update complaints
   ├── Assign complaints
   ├── View analytics
   └── Generate reports
```

The API remains the authority for authorization.

---

# Complaint lifecycle

Every complaint moves through a traceable operational lifecycle.

```text
                    ┌───────────┐
                    │ Submitted │
                    └─────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │  Review   │
                    └─────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │ Assigned  │
                    └─────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │In Progress│
                    └─────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │ Resolved  │
                    └───────────┘
```

The citizen doesn't have to repeatedly ask what happened.

The system provides the state.

---

# Analytics

The analytics layer transforms individual complaints into system-level information.

Administrators can inspect dimensions such as:

* Complaint volume
* Category distribution
* Status distribution
* Priority distribution
* Operational trends

This creates a second layer of value:

```text
Complaint
    ↓
Operational Data
    ↓
Aggregated Analytics
    ↓
Municipal Insight
```

---

# AI-generated municipal reports

CivicFlow can generate municipal reports using Google Gemini.

The report pipeline combines application data and analytics before generating the final report.

```text
MongoDB
   │
   ▼
Complaint Dataset
   │
   ▼
Analytics Layer
   │
   ▼
Gemini
   │
   ▼
Structured Municipal Report
   │
   ▼
PDF
```

This turns raw operational data into a document suitable for administrative review.

---

# API surface

## Authentication

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| `POST` | `/api/auth/register` | Register a citizen            |
| `POST` | `/api/auth/login`    | Authenticate with credentials |
| `POST` | `/api/auth/google`   | Authenticate with Google      |
| `GET`  | `/api/auth/me`       | Retrieve authenticated user   |

## Complaints

| Method  | Endpoint                           | Description            |
| ------- | ---------------------------------- | ---------------------- |
| `GET`   | `/api/complaints`                  | Retrieve complaints    |
| `POST`  | `/api/complaints`                  | Create complaint       |
| `PATCH` | `/api/complaints/{complaint_id}`   | Modify complaint       |
| `POST`  | `/api/complaints/verify-image`     | Run image verification |
| `GET`   | `/api/complaints/priority-preview` | Preview priority       |

## Analytics & Reporting

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| `GET`  | `/api/analytics/report` | Retrieve analytics data   |
| `POST` | `/api/reports/generate` | Generate municipal report |

FastAPI also exposes interactive OpenAPI documentation at:

```text
http://localhost:8000/docs
```

---

# Project structure

```text
civicflow-smart-civic/
│
├── smart-civic-backend/
│   │
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── ...
│
├── smart-civic-frontend/
│   │
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

# Local development

## Requirements

Make sure the following are installed:

* Python 3.x
* Node.js
* npm
* MongoDB or Docker
* Git

---

## 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/civicflow-smart-civic.git

cd civicflow-smart-civic
```

---

## 2. Start MongoDB

Using Docker:

```bash
docker compose up -d mongodb
```

Default connection:

```text
mongodb://localhost:27017
```

Database:

```text
smart_civic_db
```

---

## 3. Configure the backend

Create:

```text
smart-civic-backend/.env
```

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=smart_civic_db

JWT_SECRET_KEY=<long-random-secret>

GOOGLE_CLIENT_ID=<google-client-id>

CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>

GEMINI_API_KEY=<gemini-api-key>
GEMINI_MODEL=gemini-2.5-flash
```

Install dependencies:

```bash
cd smart-civic-backend

pip install -r requirements.txt
```

Run:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 4. Configure the frontend

Create:

```text
smart-civic-frontend/.env
```

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=<google-client-id>
```

Then:

```bash
cd smart-civic-frontend

npm install

npm run dev
```

Application:

```text
http://localhost:5173
```

---

# Environment variables

| Variable                | Component | Purpose                   |
| ----------------------- | --------- | ------------------------- |
| `MONGODB_URL`           | Backend   | MongoDB connection        |
| `DATABASE_NAME`         | Backend   | Database name             |
| `JWT_SECRET_KEY`        | Backend   | JWT signing secret        |
| `GOOGLE_CLIENT_ID`      | Backend   | Google authentication     |
| `CLOUDINARY_CLOUD_NAME` | Backend   | Cloudinary account        |
| `CLOUDINARY_API_KEY`    | Backend   | Cloudinary authentication |
| `CLOUDINARY_API_SECRET` | Backend   | Cloudinary authentication |
| `GEMINI_API_KEY`        | Backend   | Gemini access             |
| `GEMINI_MODEL`          | Backend   | Gemini model selection    |
| `VITE_API_URL`          | Frontend  | Backend base URL          |
| `VITE_GOOGLE_CLIENT_ID` | Frontend  | Google authentication     |

**Never commit real credentials.**

---

# Graceful development fallback

CivicFlow can operate in an in-memory mode if MongoDB is unavailable.

This makes local experimentation easier, but it is intentionally not persistent:

```text
MongoDB available
      │
      └──► Persistent application data


MongoDB unavailable
      │
      └──► In-memory development data
                     │
                     └──► Lost on restart
```

This behavior is useful for development, but persistent storage should be used for production deployments.

---

# Engineering considerations

### Image safety

Uploads larger than **5 MB** are rejected.

Images are resized before inference to reduce unnecessary computational overhead.

### Secrets

Credentials remain server-side wherever possible.

The frontend receives only configuration that is intentionally public, such as the API base URL and Google client ID.

### Business logic

Priority calculation and other important application rules are performed by the backend rather than trusted to the browser.

### External services

CivicFlow isolates external dependencies such as Cloudinary, Gemini, and Hugging Face from the core complaint workflow.

---

# Frontend routes

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

Administrative dashboard.

```text
/admin/complaints
```

Complaint operations.

```text
/admin/analytics
```

Analytics and reporting.

---

# Backend services

```text
FastAPI
│
├── Authentication
│   ├── Register
│   ├── Login
│   ├── Google OAuth
│   └── JWT
│
├── Complaints
│   ├── Creation
│   ├── Retrieval
│   ├── Updates
│   ├── Verification
│   └── Priority
│
├── Analytics
│   └── Aggregation
│
└── Reporting
    └── Gemini → PDF
```

---

# What makes CivicFlow different?

The interesting part isn't any single technology.

It is the way the technologies are connected.

```text
React
  +
FastAPI
  +
MongoDB
  +
Cloudinary
  +
YOLO
  +
Gemini
  +
JWT
  +
Docker
```

becomes:

```text
A complete civic operations pipeline.
```

The system combines:

**Human-submitted evidence**

→ **Machine-assisted verification**

→ **Backend business logic**

→ **Municipal operations**

→ **Analytics**

→ **Automated reporting**

That is the core idea behind CivicFlow.

---

# Roadmap

CivicFlow is intentionally designed so additional civic intelligence can be added without rebuilding the core platform.

### Near term

* [ ] Real-time notifications
* [ ] Geolocation-aware complaints
* [ ] Interactive civic issue map
* [ ] Expanded AI verification categories
* [ ] Improved accessibility
* [ ] Multi-language citizen interface

### Longer term

* [ ] Ward-level analytics
* [ ] Predictive issue hotspots
* [ ] Municipal SLA monitoring
* [ ] Public transparency dashboard
* [ ] Mobile applications
* [ ] Real-time operational notifications
* [ ] Historical civic trend analysis

---

# Security

Do **not** commit:

```text
.env
API keys
JWT secrets
Cloudinary credentials
Google OAuth secrets
Gemini credentials
```

Recommended `.gitignore`:

```gitignore
.env
.env.*
!.env.example

__pycache__/
*.py[cod]

node_modules/
dist/

.vscode/
.idea/

*.log
```

---

# Contributing

Contributions are welcome.

A good contribution should ideally:

1. Solve a clearly defined problem.
2. Preserve existing API contracts where possible.
3. Avoid exposing credentials or sensitive data.
4. Keep business logic on the appropriate backend layer.
5. Include relevant validation and error handling.
6. Keep the citizen experience simple.

```bash
git checkout -b feature/your-feature

git commit -m "feat: add your feature"

git push origin feature/your-feature
```

Then open a pull request.

---

# License

This project is currently distributed under the license specified in the repository.

---

<div align="center">

## CivicFlow

### **The complaint is only the beginning.**

**Report → Verify → Prioritize → Assign → Resolve → Learn**

<br />

Built with React, FastAPI, MongoDB, YOLO, Cloudinary and Gemini.

<br />

**If you find the project interesting, consider giving it a ⭐**

</div>
