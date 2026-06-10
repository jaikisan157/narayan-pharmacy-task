# Prescription Entry & Drug Interaction Checker

A specialized clinical pharmacist workstation from our pharmacy SaaS platform. Pharmacists enter prescription metadata and dynamic medication lists, and the app leverages Claude AI to analyze and flag potential drug-drug interactions, caching results in the database to prevent redundant API calls.

---

## Technical Stack
* **Backend:** Django 6.0, Django REST Framework, SQLite (database).
* **Frontend:** Next.js (App Router, JavaScript), Vanilla CSS layout.
* **AI Integration:** Official Anthropic Python SDK (with custom clinical prompts).

---

## Local Setup (Exactly 5 Commands)

Follow these simple commands to run the project locally on your machine.

### Prerequisites
* Python 3.10+ and Node.js 18+ installed on your system.

### Windows (PowerShell & Command Prompt)

```powershell
# 1. Clone the repository
git clone <repository_url>

# 2. Run the setup script (sets up virtual env, installs dependencies, templates env files)
.\setup.bat

# 3. Add your Claude API Key in backend\.env
# Open backend\.env and replace your_key_here with your real ANTHROPIC_API_KEY

# 4. Run database migrations
.\backend\.venv\Scripts\python backend\manage.py migrate

# 5. Start both backend and frontend servers
.\start.bat
```

### macOS / Linux

```bash
# 1. Clone the repository
git clone <repository_url>

# 2. Run the setup script (sets up virtual env, installs dependencies, templates env files)
bash setup.sh

# 3. Add your Claude API Key in backend/.env
# Open backend/.env and replace your_key_here with your real ANTHROPIC_API_KEY

# 4. Run database migrations
backend/.venv/bin/python backend/manage.py migrate

# 5. Start both backend and frontend servers
bash start.sh
```

> **Note:** Open `backend/.env` and replace `your_key_here` with your real Anthropic Claude API key.

---

## Core Features & Logic

### 1. Claude AI Prompting
* Utilizes a highly structured, pharmacy-specific **system instruction** forcing Claude to act as a senior clinical pharmacist.
* Enforces strict, deterministic output at `temperature=0.0`.
* Instructs Claude to return a structured JSON mapping containing `severity` (None, Mild, Moderate, Severe), clinical mechanisms, and specific recommended pharmacist actions.

### 2. Interaction Caching
* Prior to calling the Claude API, the backend normalizes drug names and dosages, sorts them alphabetically, and joins them (e.g. `lisinopril(10mg)+metformin(500mg)`) to check the database cache.
* If a match is found, the cached interaction is returned instantly, preventing redundant API cost and latency.
* If the dosage for any drug changes, a fresh API call is triggered (cache miss).

### 3. Edge Case Handling
* **Single Drug Bypassing:** Prescriptions with 1 or 0 drugs automatically bypass the Claude API call and are immediately saved with a `None` severity assessment, saving API credits.
* **API Failure Gracefulness:** If the Claude API fails (invalid key, timeout, etc.), the prescription is saved with a status of `"Error"` and a friendly warning banner is displayed in the UI instead of crashing the application.
