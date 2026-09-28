# CivicFlow Smart Civic

CivicFlow is a smart civic complaint management system with a FastAPI backend and a React/Vite frontend. Citizens can register, log in, report civic issues with photos, track complaint status, and view their own complaint history. Admin users can view the complaint queue, update status and assignment, inspect analytics, and generate municipal reports.

## Project Structure

```text
civicflow-smart-civic/
  smart-civic-backend/      FastAPI API, MongoDB, auth, image verification, reports
  smart-civic-frontend/     React + Vite frontend
  docker-compose.yml        Optional local MongoDB setup
```

## Backend Setup

Create `smart-civic-backend/.env`:

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

Install and run:

```powershell
cd smart-civic-backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend URLs:

```text
Health: http://localhost:8000
Docs:   http://localhost:8000/docs
API:    http://localhost:8000/api
```

## Frontend Setup

Create `smart-civic-frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=<google_oauth_client_id>
```

Install and run:

```powershell
cd smart-civic-frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## MongoDB

For local MongoDB with Docker:

```powershell
docker compose up -d mongodb
```

The backend defaults to:

```text
mongodb://localhost:27017
smart_civic_db
```

If MongoDB is unavailable, the backend falls back to in-memory mode. In-memory data disappears when the backend restarts.

## Main Features

- Email/password and Google auth
- Citizen and admin roles
- Citizen complaint submission
- Photo upload and Cloudinary storage
- YOLO-based image verification for pothole, road damage, and garbage
- Automatic category selection from image verification
- Backend-calculated priority score
- Complaint list, detail, status timeline, and admin operations controls
- Analytics dashboard
- Gemini-powered municipal PDF report generation

## Important Routes

Frontend:

```text
/login
/citizen
/citizen/report
/citizen/complaints
/admin
/admin/complaints
/admin/analytics
```

Backend:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
GET  /api/auth/me

GET   /api/complaints
POST  /api/complaints
PATCH /api/complaints/{complaint_id}
POST  /api/complaints/verify-image
GET   /api/complaints/priority-preview

GET  /api/analytics/report
POST /api/reports/generate
```

## Notes

- Do not commit real `.env` files or secrets.
- Keep frontend API calls based on `VITE_API_URL`.
- Keep backend secrets only in `smart-civic-backend/.env`.
- The image verification model downloads from Hugging Face on first use.
- Large uploaded images are rejected above 5 MB and resized before YOLO inference.
