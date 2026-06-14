# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Development Commands

| Task | Command | Notes |
|------|---------|-------|
| **Create a virtual environment** | `python -m venv .venv && source .venv/bin/activate` | All subsequent Python commands assume the venv is active. |
| **Install project dependencies** | `pip install -e .` <br>or <br>`pip install -r requirements.txt` | The `pyproject.toml` declares runtime deps; `-e .` installs the package in editable mode. |
| **Run the API (development)** | `uvicorn backend.app.main:app --reload --port 8000` | Hot‑reload enabled; uses `settings.APP_ENV="development"` by default. |
| **Run the API (production)** | `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT` | `PORT` is read from the `.env` (or defaults to 8000). |
| **Lint the code** | `ruff check backend/app` | Uses the `ruff` linter configured in `pyproject.toml`. |
| **Type‑check** | `mypy backend/app` | Enforces Pydantic v2 + strict typing. |
| **Run all tests** | `pytest` | Tests live under `backend/tests/` (if added). |
| **Run a single test** | `pytest -k <test_name>` | Replace `<test_name>` with the pytest function or class name. |
| **Apply DB migrations** | `alembic upgrade head` | Alembic configuration lives in `backend/alembic/`. |
| **Create a new migration** | `alembic revision -m "description"` | Write migration scripts under `backend/alembic/versions/`. |
| **Check health** | `curl http://localhost:8000/health` | Returns `{"status":"healthy"}` – no DB hit. |
| **Check readiness** | `curl http://localhost:8000/ready` | Returns `200` only when the DB connection succeeds. |

*All commands are meant to be run from the repository root.*  

---

## High‑Level Backend Architecture

```
backend/
├─ app/
│  ├─ main.py                ← FastAPI entry point, creates app, registers middleware & routers
│  ├─ config/
│  │   ├─ settings.py        ← Pydantic BaseSettings reading .env (validated on startup)
│  │   └─ database.py        ← Async SQLAlchemy engine + Base metadata
│  ├─ middleware/
│  │   ├─ auth.py            ← Auth‑middleware that injects `request.user`
│  │   └─ error_handler.py   ← Centralized JSON error responses
│  ├─ modules/
│  │   ├─ ai/                ← AI‑related endpoints (router, service, schemas)
│  │   ├─ ats/               ← Applicant‑Tracking System resources
│  │   ├─ auth/              ← Registration, login, OAuth, token refresh
│  │   ├─ resumes/           ← PDF generation/parsing utilities
│  │   ├─ users/             ← User CRUD, profile, export
│  │   └─ … (other domain resources)
│  ├─ utils/
│  │   ├─ jwt.py             ← JWT creation / verification helpers
│  │   ├─ encryption.py      ← AES‑256‑GCM utilities for third‑party tokens
│  │   ├─ ownership.py       ← `assertOwnership()` – guarantees resources belong to the caller
│  │   └─ token_compare.py   ← Timing‑safe string comparison
│  └─ types/
│      └─ common.py          ← Shared Pydantic models / type aliases
└─ alembic/                   ← Database migration scripts
```

### Core Concepts

* **FastAPI + Async SQLAlchemy** – All request handlers are async, enabling high concurrency with PostgreSQL (or any async‑compatible DB).
* **Config via `Settings`** – All environment variables are validated on import; the process aborts if required values are missing (see `backend/app/config/settings.py`).
* **Middleware Stack (order matters):**
  1. **Sentry request handler** – early error capture.
  2. **Helmet** – secure HTTP headers.
  3. **CORS** – explicit origin list from `settings.CORS_ORIGINS`.
  4. **Body parsing (`application/json` limit 10 KB).**
  5. **NoSQL injection protection** – strips `$`/`.` from incoming data.
  6. **Rate limiting** – global limiter (100 rpm) + stricter limiter on `/auth` routes (10 rpm).
  7. **Auth middleware** – validates JWT, populates `request.user`.
  8. **Central error handler** – produces the canonical `{ success: false, error: { code, message, fields? } }` shape.

* **Modules follow a *service‑router‑schema* pattern:**
  * **Router** (`router.py`) declares FastAPI endpoints and delegates to a **service** (`service.py`).
  * **Service** contains business logic, calls the **model** (`models.py`) and **utils** as needed.
  * **Schemas** (`schemas.py`) are Pydantic models for request validation and response shaping.

* **Security‑First Helpers** – `assertOwnership()` returns 404 on missing/unauthorized resources; `safeCompare()` uses `crypto.timingSafeEqual`.
* **JWT Strategy** – Short‑lived access token (15 min) sent in `Authorization: Bearer`; long‑lived refresh token stored in an HttpOnly, Secure, SameSite‑Strict cookie and rotated on each refresh.
* **Error Response Contract** – All endpoints return JSON wrapped in a top‑level `success` flag, with `error.code` & `error.message` for failures (see `docs/instruction.md` section *5. API Documentation Standard*).

---

## Important Project Documentation

| File | Why it matters for Claude Code |
|------|--------------------------------|
| `README.md` | Minimal start‑up guide (`uvicorn app.main:app`). |
| `docs/instruction.md` | Full stack blueprint, environment‑variable shapes, API docs, security checklist, CI baseline, and the **Version Safety Rule** (search & verify each dependency before pinning). |
| `docs/design-system.md` | Front‑end component library conventions (Tailwind tokens, UI component patterns). Useful when extending the UI via the `frontend/` folder. |
| `backend/app/config/settings.py` | Source of truth for required env vars, defaults, and validation logic – Claude should read this before suggesting configuration changes. |
| `backend/app/main.py` | Shows how the FastAPI app is assembled, middleware order, and router inclusion. |
| `backend/alembic/` | Migration scripts – important when adding new DB tables or altering schemas. |
| `.cursorignore` (recommended) | Prevents sensitive files (`.env*`, `node_modules/`, `dist/`) from being indexed by AI tools. |
| `backend/pyproject.toml` | Declares runtime & dev dependencies, linting (`ruff`), testing (`pytest`), and type‑checking tools. |
| `backend/postman/` (collection & environment) | Enables quick API testing; the collection follows the request/response shapes defined in the docs. |

---

## Typical Workflow for Adding a New Feature

1. **Read the relevant module** (router → service → models) to understand existing patterns.
2. **Create a migration** if the data model changes (`alembic revision -m "add xyz"`).
3. **Add Pydantic schemas** in `backend/app/modules/<module>/schemas.py` for request validation.
4. **Implement service logic** using async DB calls; always call `assertOwnership()` for user‑scoped resources.
5. **Expose endpoints** via the module’s `router.py`, respecting the global error‑response contract.
6. **Write tests** in `backend/tests/` (use `pytest-asyncio` for async endpoints).
7. **Lint & type‑check** (`ruff check`, `mypy`).
8. **Run the full test suite** (`pytest`).
9. **Update documentation** (API template in `docs/instruction.md`, Postman collection if needed).
10. **Commit** – ensure `.env*` and other secrets are excluded by `.gitignore` / `.cursorignore`.

---

## Common Gotchas & Tips for Claude Code

* **Never assume a dependency version** – always obey the *Version Safety Rule* from `docs/instruction.md`: web‑search the latest version, then verify with `npm show <pkg> version` (or `pip show <pkg>` for Python).
* **Middleware order matters** – adding a new middleware should go **after** the security headers but **before** the auth middleware if it modifies the request.
* **Error handling** – always raise an exception with `status_code` and `code` attributes; the central handler will format it. Do **not** return `HTTPException` directly from services.
* **Ownership checks** – use `assertOwnership()`; never manually compare `userId` in a controller (prevents IDOR bugs).
* **Refresh token flow** – after a successful refresh, replace the cookie and update the in‑memory token store; on failure clear the store and redirect to login.
* **Health vs. Ready** – `/health` should stay lightweight (no DB), `/ready` performs a DB ping and should be exempt from aggressive rate limits.

---

## Suggested `.cursorignore` (if not present)

```
.env
.env.*
!.env.example
node_modules/
dist/
build/
coverage/
*.pem
*.key
*.p12
*.pfx
```

These entries keep secrets and large build artefacts out of AI model context.

---

*End of CLAUDE.md.*