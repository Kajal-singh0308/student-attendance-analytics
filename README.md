# Student Attendance Analytics

A full-stack student attendance tracking web application built with **FastAPI**, **React (TypeScript)**, and **SQLite**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [License](#license)

---

## Overview

Student Attendance Analytics is a role-based attendance management system that supports three user types — **Admin**, **Faculty**, and **Student**. It allows faculty to mark attendance for their assigned sections, students to view their own attendance history on a calendar, and admins to manage users, courses, and sections from a central dashboard.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | Python 3.11+, FastAPI, SQLAlchemy, Alembic      |
| Auth       | JWT (python-jose), bcrypt / passlib             |
| Database   | SQLite (via SQLAlchemy ORM)                     |
| Frontend   | React 19, TypeScript, Vite                      |
| UI Styling | Tailwind CSS v4                                 |
| Charts     | Recharts                                        |
| HTTP       | Axios (with Vite proxy to eliminate CORS)       |
| Exports    | jsPDF, jspdf-autotable, xlsx                    |

---

## Features

### Admin
- Dashboard with system-wide stats
- Manage **Students** — create, view, update, delete
- Manage **Faculty** — create, view, update, delete
- Manage **Courses** — create and assign to sections
- Manage **Sections** — link courses, assign faculty and students

### Faculty
- Personal dashboard showing assigned sections
- **Mark Attendance** — take attendance for a section on any date
- **Class Analytics** — view per-student attendance percentages and trends

### Student
- Personal dashboard with attendance summary
- **Calendar View** — visualise present/absent days per course month-by-month

### General
- JWT-based authentication with role-aware routing
- Auto-redirect on login based on user role
- Protected routes (unauthorised users redirected to login)
- PDF and Excel export of attendance reports
- Health-check endpoint (`GET /health`)

---

## Project Structure

```
student-attendance-analytics/
├── backend/
│   ├── app/
│   │   ├── auth/            # JWT token utilities
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── routers/         # FastAPI route handlers
│   │   │   ├── admin.py     # Admin CRUD endpoints
│   │   │   ├── attendance.py# Attendance mark/query endpoints
│   │   │   ├── auth.py      # Login / token endpoints
│   │   │   └── users.py     # User profile endpoints
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic layer
│   │   ├── config.py        # App settings (loaded from .env)
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   └── main.py          # FastAPI app entry point
│   ├── alembic/             # Database migrations
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios API client modules
    │   ├── components/      # Shared UI components
    │   ├── context/         # React context (auth state)
    │   ├── hooks/           # Custom React hooks
    │   ├── pages/
    │   │   ├── admin/       # Admin dashboard pages
    │   │   ├── faculty/     # Faculty dashboard pages
    │   │   └── student/     # Student dashboard pages
    │   ├── types/           # TypeScript type definitions
    │   ├── utils/           # Helper utilities
    │   ├── App.tsx          # Root component & routing
    │   └── main.tsx         # React entry point
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm 9 or higher

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your environment file
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
# Edit .env and set a strong SECRET_KEY

# 5. Run database migrations
alembic upgrade head

# 6. Start the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

> **Note:** The Vite dev server is configured to proxy `/api` requests to `http://localhost:8000`, so no CORS issues arise during development.

---

## Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable                    | Description                              | Default                        |
|-----------------------------|------------------------------------------|--------------------------------|
| `SECRET_KEY`                | Secret key used to sign JWT tokens       | `supersecretkey_change_in_prod`|
| `ALGORITHM`                 | JWT signing algorithm                    | `HS256`                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token validity duration (minutes)      | `480`                          |

> **Important:** Always change `SECRET_KEY` to a long, random string in production.

---

## API Overview

| Method | Endpoint                    | Description                          | Auth Required |
|--------|-----------------------------|--------------------------------------|---------------|
| POST   | `/auth/login`               | Obtain JWT access token              | No            |
| GET    | `/health`                   | Service health check                 | No            |
| GET    | `/users/me`                 | Get current user profile             | Yes           |
| GET    | `/admin/students`           | List all students                    | Admin         |
| POST   | `/admin/students`           | Create a student                     | Admin         |
| GET    | `/admin/faculty`            | List all faculty                     | Admin         |
| POST   | `/admin/faculty`            | Create a faculty member              | Admin         |
| GET    | `/admin/courses`            | List all courses                     | Admin         |
| POST   | `/admin/courses`            | Create a course                      | Admin         |
| GET    | `/admin/sections`           | List all sections                    | Admin         |
| POST   | `/admin/sections`           | Create a section                     | Admin         |
| POST   | `/attendance/mark`          | Mark attendance for a session        | Faculty       |
| GET    | `/attendance/section/{id}`  | Get attendance records for a section | Faculty/Admin |
| GET    | `/attendance/student/{id}`  | Get attendance records for a student | Student/Admin |

Full interactive API documentation is available at `http://localhost:8000/docs` when the backend is running.

---

## User Roles

| Role    | Access                                                                 |
|---------|------------------------------------------------------------------------|
| Admin   | Full system management: users, courses, sections, analytics            |
| Faculty | Mark attendance for assigned sections, view class analytics            |
| Student | View own attendance history and calendar                               |

---

## License

This project is open source and available under the [MIT License](LICENSE).
