# CLAUDE.md - Developer Guidelines

## Project Overview
This application is a Prescription Entry & Drug Interaction Checker for a pharmacy SaaS suite. It allows pharmacists to record prescriptions and uses Claude AI to analyze and flag dangerous drug interactions before dispensing, using database-level caching to prevent redundant API calls.

## Tech Stack & Structure
* **Backend:** Django (Python), Django REST Framework, SQLite.
* **Frontend:** Next.js (App Router, JavaScript), Vanilla CSS.
```
narayan-pharmacy-task/
├── backend/
│   ├── api/            # Django app for REST API, models, and Claude utils
│   ├── config/         # Django project configuration settings and URLs
│   ├── db.sqlite3      # SQLite local database
│   └── requirements.txt
├── frontend/
│   ├── src/app/        # Next.js page routes, layouts, and styles
│   └── package.json
├── README.md
├── CLAUDE.md
├── MEMORY.md
├── start.bat           # Server launcher script
└── .env.example
```

## Running the Project Locally

### Environment Variables
Both backend and frontend require `.env` files copied from `.env.example`:
* **Backend (`backend/.env`):** Requires `ANTHROPIC_API_KEY` for Claude check.
* **Frontend (`frontend/.env`):** Requires `NEXT_PUBLIC_API_URL` (defaults to `http://127.0.0.1:8000`).

### Execution Commands
* **Run Django Server:**
  `cd backend && .venv/Scripts/python manage.py runserver`
* **Run Next.js Dev Server (Bypassing Windows Ampersand Bug):**
  `cd frontend && node "node_modules/next/dist/bin/next" dev`
* **Run Both Simultaneously:**
  `start.bat` from root.
* **Backend Migrations:**
  `python manage.py makemigrations && python manage.py migrate`

## Code Conventions
* **REST API:**
  * Endpoint URLs must end in trailing slashes (Django standard).
  * Payload structure for prescriptions: `{"patient_name": "...", "doctor_name": "...", "date": "YYYY-MM-DD", "items": [{"drug_name": "...", "dosage": "..."}]}`.
* **Naming Standards:**
  * Python: `snake_case` for variables/methods, `PascalCase` for models/views.
  * Javascript: `camelCase` for variables/states, `PascalCase` for React components.
* **Interaction Caching:**
  * Drug combinations are cached alphabetically by joining normalized lowercase names with `+` (e.g. `caffeine+ciprofloxacin`).
  * API checks are bypassed if the prescription contains `count <= 1` drugs.
