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
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20Google-FFB300?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

<p align="center">
  <strong>React · Vite · FastAPI · MongoDB · JWT · YOLO · Cloudinary · Gemini · Docker</strong>
</p>

---

# Product

CivicFlow connects two sides of a civic system.

**Citizens** get a simple way to report problems, provide evidence, and track what happens next.

**Municipal administrators** get an operational system for reviewing, prioritizing, assigning, resolving, analyzing, and reporting those issues.

The result is a complete complaint lifecycle:

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
````

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
* Multi-language interface
* Accessibility controls
* Narrator assistance
* Adjustable text size
* High-contrast accessibility mode
* Reduced-motion support
* Keyboard navigation support

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
* Administrative authentication
* Role-based access

</td>
</tr>
</table>

---

# The interesting part: AI-assisted verification

One of the central pieces of CivicFlow is the image verification pipeline.

A citizen can submit an image as evidence rather than relying exclusively on a textual description.

The backend processes the image through a YOLO-based verification model capable of assisting with supported civic issue categories such as:

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

The verification model is loaded through the backend image-verification service.

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
│  Accessibility · Localization · Settings                      │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               │ REST / JSON
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                         API LAYER                             │
│                                                               │
│                         FastAPI                               │
│                                                               │
│  Authentication · Complaints · Analytics · Reports · AI       │
└──────────────┬────────────────┬────────────────┬──────────────┘
               │                │                │
               ▼                ▼                ▼
        ┌────────────┐   ┌─────────────┐   ┌──────────────┐
        │ MongoDB    │   │ Cloudinary  │   │ AI Services  │
        │            │   │             │   │              │
        │ Citizens   │   │ Evidence    │   │ YOLO         │
        │ Admins     │   │ Images      │   │ Gemini       │
        │ Complaints │   │             │   │ Google       │
        │ Analytics  │   │             │   │ OAuth        │
        └────────────┘   └─────────────┘   └──────────────┘
```

---

# Backend architecture

CivicFlow's backend is structured around clear responsibilities rather than putting application logic directly inside route handlers.

```text
smart-civic-backend/
│
├── main.py
├── config.py
├── database.py
├── priority.py
│
├── routes/
│   ├── auth.py
│   ├── complaints.py
│   ├── analytics.py
│   ├── reports.py
│   └── ai.py
│
├── services/
│   ├── auth_service.py
│   ├── ai_service.py
│   ├── gemini_service.py
│   ├── pdf_service.py
│   └── prioritization_service.py
│
├── models/
│   ├── user.py
│   └── complaint.py
│
├── Image-Verification/
│   ├── vision_service.py
│   ├── test_vision.py
│   └── model/
│
└── seed_db.py
```

The architecture separates:

* API routing
* Authentication
* Business logic
* Validation
* Database access
* AI services
* Image verification
* Priority calculation
* Report generation

This allows individual components to evolve without placing the entire application inside a single route or controller.

---

# Authentication

CivicFlow supports multiple authentication mechanisms.

## Email / Password

Traditional registration and login backed by JWT authentication.

Passwords are hashed using **Argon2id** before being stored.

## Google

Google OAuth / Google Identity credentials are sent to the FastAPI backend for verification.

The backend verifies the Google credential and creates or updates the corresponding user record.

## Role-based access

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

# JWT session flow

CivicFlow uses signed JWT access tokens for authenticated sessions.

The current implementation works as follows:

```text
User
 │
 │ Email + Password
 ▼
FastAPI /api/auth/login
 │
 │ Credentials verified
 ▼
JWT generated
 │
 │ access_token
 ▼
React frontend
 │
 │ localStorage
 │ "civic_token"
 ▼
Authenticated API request
 │
 │ Authorization: Bearer <JWT>
 ▼
FastAPI
 │
 │ JWT signature + expiration verified
 ▼
Protected resource
```

The JWT payload contains claims including:

```text
sub   → authenticated user's email
name  → user's name
role  → citizen / admin
exp   → token expiration
```

The backend signs the token using the configured JWT secret and the `HS256` algorithm.

The current token lifetime is:

```text
7 days
```

The frontend stores the returned access token using:

```javascript
localStorage.setItem("civic_token", data.access_token);
```

User profile information is stored separately as:

```text
civic_user
```

Protected frontend requests retrieve the JWT from local storage and send it using:

```http
Authorization: Bearer <JWT>
```

The backend decodes and validates the JWT before processing authenticated requests.

> **Important:** JWTs are signed rather than encrypted. Sensitive information such as passwords must never be placed inside the token payload.

---

# Authentication API

The authentication layer exposes:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
GET  /api/auth/me
```

### Registration

A new account is created as either a citizen or administrator based on the application's role determination logic.

### Login

The backend:

1. Locates the account.
2. Verifies the password hash.
3. Determines the user's role.
4. Creates a signed JWT.
5. Returns the access token and user profile.

### Google authentication

The frontend receives a Google credential and sends it to:

```text
POST /api/auth/google
```

The backend verifies the credential and returns a CivicFlow JWT.

### Current-user endpoint

The authenticated client can retrieve the current user through:

```text
GET /api/auth/me
```

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

The system provides the state and complaint history through the application.

---

# Citizen workflow

A typical citizen workflow is:

```text
Login
  ↓
Citizen Dashboard
  ↓
Report an Issue
  ↓
Add Description
  ↓
Add Location
  ↓
Upload Evidence
  ↓
AI-assisted Verification
  ↓
Category / Priority
  ↓
Submit Complaint
  ↓
Track Complaint
  ↓
Resolution
```

Citizens can view their complaint history and inspect the status of submitted issues.

---

# Municipal workflow

The administrator workflow is:

```text
Admin Login
    ↓
Operations Dashboard
    ↓
Complaint Queue
    ↓
Review Complaint
    ↓
Inspect Priority / Category
    ↓
Assign Complaint
    ↓
Update Status
    ↓
Resolve Complaint
    ↓
Analytics / Reporting
```

This provides administrators with a centralized operational view instead of requiring complaints to be processed independently.

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

# Accessibility

Accessibility is treated as a first-class part of the frontend experience.

CivicFlow includes an accessibility settings panel with configurable features such as:

* Narrator
* Text scaling
* High contrast
* Reduced motion
* Keyboard navigation
* Focus indicators
* Large click targets
* Clear language
* Captions
* Transcripts
* Adjustable narrator audio
* Accessibility-friendly visual presentation

## Narrator

The narrator provides spoken descriptions of interactive controls.

Its interaction model is designed around:

```text
First click
    ↓
Narrate control name + current state + purpose

Second click
    ↓
Activate control
```

The narrator also provides an initial accessibility welcome on the dashboard.

It is intentionally excluded from the login/create-account experience.

## Text scaling

The interface supports multiple text-size stages, ranging from the normal scale up to approximately **200%**.

## Reduced motion

Users can disable non-essential animations through accessibility settings.

## Keyboard navigation

Interactive elements are designed to remain accessible through keyboard navigation and visible focus indicators.

## High contrast

High contrast is implemented as a dedicated accessibility mode rather than simply applying a global contrast filter.

## Transcripts

Narrator output can be surfaced through the transcript interface when enabled.

---

# Internationalization

CivicFlow uses `i18next` and `react-i18next` for multilingual UI support.

The architecture is based around translation keys rather than hard-coded interface text.

English acts as the fallback language.

The interface includes Indian-language localization, including Hindi, while keeping the translation system extensible for additional languages.

```text
Translation Key
       │
       ▼
i18next
       │
       ├── English
       ├── Hindi
       └── Additional locales
```

This allows the same application interface to switch languages without rewriting individual components.

---

# API surface

## Authentication

| Method | Endpoint             | Description                         |
| ------ | -------------------- | ----------------------------------- |
| `POST` | `/api/auth/register` | Register a citizen or administrator |
| `POST` | `/api/auth/login`    | Authenticate with credentials       |
| `POST` | `/api/auth/google`   | Authenticate with Google            |
| `GET`  | `/api/auth/me`       | Retrieve authenticated user         |

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
│   ├── config.py
│   ├── database.py
│   ├── priority.py
│   ├── requirements.txt
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── Image-Verification/
│   └── seed_db.py
│
├── smart-civic-frontend/
│   │
│   ├── src/
│   │   ├── accessibility/
│   │   ├── components/
│   │   ├── data/
│   │   ├── i18n/
│   │   ├── pages/
│   │   ├── services/
│   │   └── theme/
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── docker-compose.yml
├── render.yaml
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
git clone https://github.com/MustafaKhurram2k4/civicflow-smart-civic-dev.git

cd civicflow-smart-civic-dev
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

Example:

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

Run the backend:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

## 4. Configure the frontend

Create:

```text
smart-civic-frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=<google-client-id>
```

Install dependencies:

```bash
cd smart-civic-frontend

npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

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

CivicFlow includes an in-memory development fallback for situations where MongoDB is temporarily unavailable.

This allows local experimentation without requiring a persistent database connection.

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

This behavior is intended for development and testing.

Persistent MongoDB storage should be used for production deployments.

---

# Engineering considerations

## Image safety

Uploads larger than **5 MB** are rejected.

Images are resized before inference to reduce unnecessary computational overhead.

## Password security

Passwords are hashed using **Argon2id** before being persisted.

Passwords are never returned to the frontend as part of the user response.

## JWT security

JWTs are signed using the configured server-side secret and `HS256`.

The default access-token lifetime in the current backend configuration is:

```text
7 days
```

The signing secret must be provided through environment configuration in production.

## Secrets

Credentials remain server-side wherever possible.

The frontend receives only configuration that is intentionally public, such as the API base URL and Google client ID.

## Business logic

Priority calculation and other important application rules are performed by the backend rather than trusted to the browser.

## External services

CivicFlow isolates external dependencies such as Cloudinary, Gemini, Google authentication, and the image-verification model from the core complaint workflow.

---

# Frontend routes

## Authentication

```text
/login
```

Authentication and account creation.

## Citizen

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
/citizen/settings
```

Citizen settings and accessibility configuration.

## Administration

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

```text
/admin/settings
```

Administrative settings and accessibility configuration.

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
├── AI
│   └── Gemini
│
├── Image Verification
│   └── YOLO
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
Google OAuth
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

# Design philosophy

CivicFlow is designed around several principles.

### Citizen-first

The citizen should be able to report and track an issue without navigating a complicated workflow.

### Backend authority

Important business rules and authorization decisions belong to the backend rather than the browser.

### Explainable workflow

A complaint should have a visible state and a traceable operational lifecycle.

### Modular architecture

Authentication, complaints, AI processing, analytics and reporting are separated into dedicated modules.

### Accessibility by design

Accessibility is integrated into the interface rather than treated as an afterthought.

### Extensible intelligence

The AI layer is designed as an assisting component that can evolve independently from the core complaint-management workflow.

---

# Roadmap

CivicFlow is intentionally designed so additional civic intelligence can be added without rebuilding the core platform.

### Near term

* [ ] Real-time notifications
* [ ] Geolocation-aware complaints
* [ ] Interactive civic issue map
* [ ] Expanded AI verification categories
* [x] Accessibility system
* [x] Multi-language interface
* [x] Narrator assistance
* [x] Adjustable text scaling
* [x] High-contrast mode
* [x] Reduced-motion support

### Longer term

* [ ] Ward-level analytics
* [ ] Predictive issue hotspots
* [ ] Municipal SLA monitoring
* [ ] Public transparency dashboard
* [ ] Mobile applications
* [ ] Real-time operational notifications
* [ ] Historical civic trend analysis
* [ ] Expanded civic issue intelligence

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
7. Preserve accessibility and localization support.

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Commit your changes:

```bash
git commit -m "feat: add your-feature"
```

Push the branch:

```bash
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
```
