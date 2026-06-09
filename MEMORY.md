# MEMORY.md - AI Workflow & Thought Process

## 1. Initial Prompt & Analysis
* **Goal:** Create a focused "Prescription Entry & Drug Interaction Checker" using Django and Next.js, with Claude API integration.
* **Core Constraint Checklist:**
  * Django backend with migrations (SQLite chosen for local portability).
  * Next.js frontend with no raw JSON displayed.
  * Caching drug interactions in the DB.
  * Skipping Claude check for single drug prescriptions.
  * Handling Claude API errors gracefully without crashing the UI.
  * Clear setup in under 5 commands.
  * Detailed workflow logs (`CLAUDE.md` and `MEMORY.md`).

---

## 2. Architectural Decisions & Trade-Offs

### Database Caching Strategy
* **Option A (Pairwise Caching):** Break multi-drug inputs into pairs (A+B, B+C, A+C), check if each pair is cached, call Claude for missing pairs, and compile the final report.
* **Option B (Alphabetical Combination Caching):** Normalize, sort, and join all drugs in the prescription (e.g., `lisinopril+metformin`) as a single cache key.
* **Decision:** We chose **Option B**. For a lightweight prescription app, querying Claude for the entire active combination preserves the clinical context of triple/quadruple-drug interactions (which pairwise analysis might overlook). To keep it robust, we sort them alphabetically so the order in which the pharmacist enters them does not affect the cache.

### Django Model Schema Integration
* We decided to save the final `severity` and `interaction_result` (clinical summary) directly inside the `Prescription` model row in addition to caching the full detailed JSON in `InteractionCache`. This guarantees that Screen 2's list table and modals load instantaneously, and records are self-contained even if the cache table is cleared.

---

## 3. Progression & Iteration

### Phase 1: Backend Scaffolding
* Created models, serialisers, views, and routing.
* Used `python-dotenv` to isolate keys securely from code.
* Ran migrations successfully.

### Phase 2: Claude Prompt Refinement
* *Initial Idea:* Single simple prompt asking for interaction warnings.
* *Correction:* To guarantee no raw JSON is dumped in the UI, we used Claude's `system` prompt parameter to force it to act strictly as a clinical pharmacist and respond in **pure JSON** matching our specific schema. We defined clinical criteria for each severity tier (`Severe`, `Moderate`, `Mild`, `None`) to improve classification consistency.

### Phase 3: Frontend Scaffolding & Windows Path Course Correction
* *Gotcha:* The workspace folder is named `Prescription Entry & Drug Interaction Checker`.
* *Issue:* The `&` character is a reserved command separator in Windows CMD. Running `npm run dev` spawns sub-processes that split on `&`, crashing Next.js with `Cannot find module 'C:\Users\jaikisan\OneDrive\Desktop\next\dist\bin\next'`.
* *Solution:* We bypassed `npm run dev` by invoking Node directly with quoted paths: `node "node_modules\next\dist\bin\next" dev`. This resolved the issue instantly.
* We created a root `start.bat` launcher using this quoted command to ensure the interviewer can run both servers in a single command without encountering path errors.

### Phase 4: UX Refinement
* *Issue:* During browser subagent testing, we observed that on smaller screens, the modal popup occupied the entire viewport, making it difficult to click outside to close the card.
* *Solution:* Added a dedicated `"Close Profile"` button at the bottom of the modal content card for both successful data displays and fallback error states. This significantly enhanced the accessibility and responsiveness of Screen 2.

### Phase 5: Caching Refinement & 2026 Model Deprecations (Post-Feedback Iteration)
* *Tip from Reviewer:* Dosage levels impact clinical drug-drug interactions, so caching must differentiate based on dosage.
* *Solution:* We redesigned our combination key normalizer (`normalize_drug_key` in `utils.py`) to map drug names and dosages (e.g. `sildenafil(50mg)+nitroglycerin(0.4mg)`). This allows new checks to trigger if dosages change, fulfilling the reviewer's guidance.
* *API Error:* A `404 not_found_error` was returned for the legacy `claude-3-5-sonnet-20241022` model.
* *Investigation:* Probed the active model endpoints using a custom list models diagnostic script (`list_models.py`). Discovered that in mid-2026, older 3.x models are deprecated and retired, replaced by the Claude 4.x family (such as `claude-sonnet-4-6` and `claude-opus-4-8`).
* *Action:* Configured the application default model to `claude-sonnet-4-6` and updated local `.env` and `.env.example` configurations, enabling successful live API testing.
* *Deployment Protection:* To safeguard the candidate's personal Anthropic credits upon public deployment, we integrated Django REST Framework's **`AnonRateThrottle`** in `settings.py` (limited to 50 requests per day per IP). This blocks bot-abuse and spammers while leaving ample headroom for the interview panel to test the live application.


