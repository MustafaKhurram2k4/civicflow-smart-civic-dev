---
title: CivicFlow Smart Civic Backend
emoji: 🏙️
colorFrom: blue
colorTo: green
sdk: docker
app_port: 8000
pinned: false
---

# CivicFlow Smart Civic Backend API

FastAPI backend with PyTorch YOLOv8 image verification, MongoDB database, Cloudinary media storage, and Gemini 2.5 Flash municipal reporting.

## Direct API Access
This Hugging Face Space serves as the REST API backend for the CivicFlow React frontend.

- **Health Check**: `GET /`
- **Interactive Swagger Docs**: `GET /docs`
- **Complaints API**: `POST/GET /api/complaints`
- **AI Municipal Reports**: `POST /api/reports/generate`
