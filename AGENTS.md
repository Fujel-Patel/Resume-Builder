# AGENTS.md — Generative-CV

Two independent packages live at the root: `backend/` (FastAPI, Python ≥3.12) and `frontend/` (Next.js 15, React 19). No monorepo tool — commands assume repo root is the working directory.

Existing instruction file: `CLAUDE.md` (read it first for architecture overview and workflow). `docs/instruction.md` is the canonical full-stack blueprint (1580 lines).

---

## Commands

| Context | Task | Command | Notes |
|---------|------|---------|-------|
| Backend | Install | `pip install -e "backend/[dev]"` | Requires venv active |
| Backend | Dev server | `uvicorn backend.app.main:app --reload --port 8000` | `.env` lives at `backend/.env` |
| Backend | Lint | `ruff check backend/app` | |
| Backend | Type-check | `mypy backend/app` | |
| Backend | Test (all) | `pytest backend` | DB fully mocked (AsyncMock), no DB needed |
| Backend | Test (single) | `pytest backend -k <test_name>` | |
| Backend | Migrate up | `alembic upgrade head` | Must run from `backend/` directory |
| Backend | New migration | `alembic revision -m "msg"` | Run from `backend/` |
| Frontend | Install | `npm install` | Run from `frontend/` |
| Frontend | Dev server | `npm run dev` | Runs on :3000, uses `frontend/.env.local` |
| Frontend | Lint | `npm run lint` | |
| Frontend | Build | `npm run build` | |

---

## Architecture

### Backend (`backend/app/main.py`)

Routers under `/api/v1/`. OpenAPI docs only when `APP_ENV=development`.

**Actual middleware order (CLAUDE.md is inaccurate here):**
1. `SlowAPIMiddleware` — rate limiter (100/min global)
2. `AuthMiddleware` — non-blocking JWT decode → `request.state.user_id` (or None)
3. `ErrorHandlerMiddleware` — wraps all responses in `{success, data, error}` shape
4. `CORSMiddleware` — outermost, explicit origins only

No Sentry, Helmet, NoSQL injection, or body-parsing middleware exist in code.

**Module pattern:** `router.py` → `service.py` → `models.py` + `schemas.py` (Pydantic v2)

**Key security rules:**
- `SECRET_KEY` has NO default — must be in `backend/.env` or startup crashes
- Two separate JWT secrets: `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- `assert_ownership()` always returns **404** (never 403) to avoid resource enumeration
- AI provider API keys encrypted with AES-256-GCM via `utils/encryption.py`
- Rate limiting: 100/min global, auth endpoints 10/min
- File uploads: 5MB max, PDF/DOCX only

**Testing:** `backend/tests/conftest.py` replaces lifespan with noop, mocks DB via `AsyncMock`, and overrides the `get_db` and `get_current_user` dependencies. No database required.

**Migrations:** `backend/alembic/env.py` converts async DATABASE_URL to sync (`+asyncpg://` → `+psycopg2://`) for Alembic compatibility. Run migrations from `backend/`.

### Frontend (`frontend/src/app/layout.tsx`)

- State: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)
- UI: shadcn/ui with "base-nova" style (not "new-york")
- Brand color: `#00FFF0`
- Dark mode default via `next-themes`
- Toasts: `sonner`
- API client at `frontend/src/lib/api/client.ts` (implied by `lib/api/` structure)
- `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`

---

## Notable gaps / stale claims in CLAUDE.md

- **Middleware stack**: CLAUDE.md lists 8 layers (Sentry, Helmet, body parsing, NoSQL protection) — none exist. Actual stack is above.
- **`backend/postman/`**: Referenced but does not exist on disk.
- **`.cursorignore`**: Does not exist (recommended but not present).
- **`pre-commit`**: Listed as dev dep but no `.pre-commit-config.yaml` exists.

---

## Gotchas

- Error responses must use `HTTPException` with `detail` as dict `{code, message, fields?}` — never return raw `HTTPException` from services.
- `SECRET_KEY` must be set in `backend/.env` — no default, app crashes without it.
- JWT uses HS256, access=15min, refresh=7d (HttpOnly/Secure/SameSite=Strict cookie, rotated on refresh).
- Refresh token SHA-256 hashed in DB.

---

## Session history

### Template builder refactor (Jun 20 — same session continued)

**Problem:** The pdf2docx → XML injection pipeline produced weird fonts, misaligned logos, and broken word splits. pdf2docx output was not a suitable canvas for text replacement (approximate layout, arbitrary run splits).

**Solution:** Scrapped pdf2docx entirely. New approach: PDF → extract text → AI optimize → build fresh DOCX from reference template programmatically.

| File | Role |
|------|------|
| `backend/app/utils/template_builder.py` | **New** — `build_base_nova_template()` + `make_resume_docx()`. Programmatic Base-Nova DOCX builder using python-docx. Karla font, brand color `#00FFF0`, section underlines, proper bullet lists, inline role+duration paragraphs. |
| `backend/app/utils/docx_injector.py` | **Rewritten** — was 246 lines of XML-injection + pdf2docx. Now a 24-line wrapper calling `make_resume_docx()`. All fragile logic (Jaccard matching, proportional run splitting, `<w:t>` manipulation) removed. |
| `backend/pyproject.toml` | Removed `pdf2docx` dependency. `python-docx` + `PyMuPDF` (fitz) remain. |

**Notable decisions:**
- Template built programmatically (not manually crafted `.docx` file) → version-controlled, maintainable
- `inject_into_docx()` signature preserved → no router changes needed
- Both PDF and DOCX uploads produce uniformly styled Base-Nova output
- `style_extractor.py` / Jinja2 preview left untouched (separate concern)

**Tests:** 43/43 passing. Run with `backend/.venv/bin/pytest backend`. `ruff check --fix` clean.
