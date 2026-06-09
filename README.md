# Prescription Entry & Drug Interaction Checker

A specialized clinical pharmacist workstation from our pharmacy SaaS platform. Pharmacists enter prescription metadata and dynamic medication lists, and the app leverages Claude AI to analyze and flag potential drug-drug interactions, caching results in the database to prevent redundant API calls.

---

## Technical Stack
* **Backend:** Django 6.0, Django REST Framework, SQLite (database).
* **Frontend:** Next.js (App Router, JavaScript), Vanilla CSS layout.
* **AI Integration:** Official Anthropic Python SDK (with custom clinical prompts).

---

## Local Setup (Under 5 Commands)

Follow these simple commands to run the project locally on your machine.

### Prerequisites
* Python 3.10+ and Node.js 18+ installed on your system.

### Installation & Run Steps

**1. Create and activate Python virtual environment, then install backend dependencies:**
```bash
python -m venv backend\.venv
backend\.venv\Scripts\pip install -r backend\requirements.txt
```

**2. Configure environment files:**
```bash
copy .env.example backend\.env
copy .env.example frontend\.env
```
*(Note: Open `backend/.env` and replace `your_key_here` with your real Anthropic Claude API key).*

**3. Run database migrations:**
```bash
backend\.venv\Scripts\python backend\manage.py migrate
```

**4. Install frontend packages:**
```bash
cd frontend
npm install
cd ..
```

**5. Start both servers in parallel:**
```bash
start.bat
```
*(Note: `start.bat` will launch two separate terminal windows for Django and Next.js, handling Windows paths containing spaces and ampersands automatically).*

---

## Core Features & Logic

### 1. Claude AI Prompting
* Utilizes a highly structured, pharmacy-specific **system instruction** forcing Claude to act as a senior clinical pharmacist.
* Enforces strict, deterministic output at `temperature=0.0`.
* Instructs Claude to return a structured JSON mapping containing `severity` (None, Mild, Moderate, Severe), clinical mechanisms, and specific recommended pharmacist actions.

### 2. Interaction Caching
* Prior to calling the Claude API, the backend strips whitespaces, converts names to lowercase, sorts the medications alphabetically, and joins them (e.g. `lisinopril+metformin`) to check the database cache.
* If a match is found, the cached interaction is returned instantly, preventing redundant API cost and latency.

### 3. Edge Case Handling
* **Single Drug Bypassing:** Prescriptions with 1 or 0 drugs automatically bypass the Claude API call and are immediately saved with a `None` severity assessment, saving API credits.
* **API Failure Gracefulness:** If the Claude API fails (invalid key, timeout, etc.), the prescription is saved with a status of `"Error"` and a friendly warning banner is displayed in the UI instead of crashing the application.
