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

# Product

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
