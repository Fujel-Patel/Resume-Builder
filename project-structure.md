# Generative-CV — Project Structure

## Overview

Generative-CV is an **AI-powered resume builder SaaS** application. It consists of two independent packages:

- **Backend** (`backend/`): FastAPI (Python 3.12+) — RESTful API with JWT authentication, AI-powered resume generation via multiple LLM providers, ATS (Applicant Tracking System) scoring, DOCX/PDF export, and more.
- **Frontend** (`frontend/`): Next.js 15 (React 19) — Modern web UI with Redux Toolkit state management, shadcn/ui components, dark mode, and interactive resume builder with drag-and-drop sections.

---

## Directory Tree

```
.agent/
├── skills/
│   └── fastapi-helper/
│       └── SKILL.md
.claude/
├── agents/
│   ├── api-designer.md
│   ├── backend-developer.md
│   ├── code-reviewer.md
│   ├── debugger.md
│   ├── error-detective.md
│   ├── fastapi-developer.md
│   ├── fullstack-developer.md
│   ├── nextjs-developer.md
│   ├── research-analyst.md
│   └── ui-designer.md
├── projects/
│   └── -home-fujel-Documents-Fujel-Developer-Resume-Builder-resume-ai/
│       └── memory/
│           └── MEMORY.md
├── settings.local.json
├── skills/
│   ├── supabase
│   └── supabase-postgres-best-practices
└── worktrees/
.gitignore
.opencode/
├── .gitignore
├── package-lock.json
└── package.json
.vscode/
└── launch.json
AGENTS.md
CLAUDE.md
README.md
backend/
├── .env
├── .env.example
├── .gitignore
├── API.md
├── alembic/
│   ├── env.py
│   └── versions/
│       ├── 20240614_add_auth_constraints.py
│       ├── 20240616_add_model_to_ai_providers_and_ats_scans.py
│       ├── 20240617_add_original_file_fields_to_resumes.py
│       ├── 20250619_add_skill_groups_to_resume_data.py
│       ├── 20250619_add_template_style_to_resume_data.py
│       └── 20250620_add_injected_file_path_to_resumes.py
├── alembic.ini
├── app/
│   ├── config/
│   │   ├── database.py
│   │   └── settings.py
│   ├── main.py
│   ├── middleware/
│   │   ├── auth.py
│   │   └── error_handler.py
│   ├── modules/
│   │   ├── ai/
│   │   │   ├── models.py
│   │   │   ├── prompts.py
│   │   │   ├── providers/
│   │   │   │   ├── anthropic.py
│   │   │   │   ├── gemini.py
│   │   │   │   ├── nvidia_nim.py
│   │   │   │   └── openai_compatible.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   ├── ai_providers/
│   │   │   └── router.py
│   │   ├── ats/
│   │   │   ├── models.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   └── service.py
│   │   ├── auth/
│   │   │   ├── EXCEPTION_PLAN.md
│   │   │   ├── exceptions.py
│   │   │   ├── models.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   └── utils.py
│   │   ├── resumes/
│   │   │   ├── export.py
│   │   │   ├── models.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   └── templates/
│   │   │       ├── classic.html
│   │   │       ├── creative.html
│   │   │       ├── default.html
│   │   │       ├── minimal.html
│   │   │       └── modern.html
│   │   └── users/
│   │       ├── models.py
│   │       ├── router.py
│   │       ├── schemas.py
│   │       └── service.py
│   ├── types/
│   │   └── common.py
│   └── utils/
│       ├── ai.py
│       ├── auth.py
│       ├── docx_injector.py
│       ├── email.py
│       ├── email_sender.py
│       ├── encryption.py
│       ├── jwt.py
│       ├── ownership.py
│       ├── password.py
│       ├── pdf_exporter.py
│       ├── pdf_parser.py
│       ├── style_extractor.py
│       ├── template_builder.py
│       └── token.py
├── pyproject.toml
├── requirements.txt
├── server.log
└── tests/
    ├── conftest.py
    ├── test_ai_providers.py
    ├── test_ai_suggest.py
    └── test_ats_score.py
docs/
├── DESIGN.md
├── GenerativeCV_PRD.md
├── design-system.md
└── instruction.md
frontend/
├── .env.local
├── .gitignore
├── README.md
├── components.json
├── eslint.config.mjs
├── frontend-structure.md
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── ai-generator/
│   │   │   ├── ai-generator.tsx
│   │   │   └── page.tsx
│   │   ├── ats-score/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── ats/
│   │   │   ├── dashboard-home.tsx
│   │   │   ├── generator/
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   ├── resumes/
│   │   │   └── settings/
│   │   ├── favicon.ico
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── profile-page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   ├── resume/
│   │   │   ├── new/
│   │   │   │   ├── page.tsx
│   │   │   │   └── resume-builder.tsx
│   │   │   ├── page.tsx
│   │   │   └── resume-page.tsx
│   │   ├── settings/
│   │   │   └── ai/
│   │   │       ├── ai-settings.tsx
│   │   │       └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── auth-guard.tsx
│   │   │   └── unauthorized-overlay.tsx
│   │   ├── landing/
│   │   │   ├── cta.tsx
│   │   │   ├── features.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── hero.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── landing-resume-preview.tsx
│   │   │   ├── pricing.tsx
│   │   │   ├── public-navbar.tsx
│   │   │   └── trust-bar.tsx
│   │   ├── layout/
│   │   │   ├── dashboard-shell.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── resume-templates/
│   │   │   └── base-nova/
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── enhanced-card.tsx
│   │       ├── file-upload.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── stat-card.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── contexts/
│   │   └── sidebar-context.tsx
│   ├── features/
│   │   ├── ai/
│   │   │   └── ai-suggest-button.tsx
│   │   ├── ats/
│   │   │   └── ats-score-page.tsx
│   │   ├── auth/
│   │   │   ├── auth-layout.tsx
│   │   │   ├── forgot-password-form.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── reset-password-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── resume/
│   │   │   ├── editor-panel.tsx
│   │   │   ├── form-section.tsx
│   │   │   ├── preview-panel.tsx
│   │   │   ├── resume-list-item.tsx
│   │   │   ├── resume-preview.tsx
│   │   │   ├── score-gauge.tsx
│   │   │   ├── tag-input.tsx
│   │   │   ├── template-switcher.tsx
│   │   │   └── types.ts
│   │   └── resume-builder/
│   │       ├── builder-layout.tsx
│   │       ├── editor/
│   │       │   ├── dnd-section-list.tsx
│   │       │   ├── editor-panel.tsx
│   │       │   ├── sections/
│   │       │   │   ├── awards-editor.tsx
│   │       │   │   ├── certifications-editor.tsx
│   │       │   │   ├── contact-editor.tsx
│   │       │   │   ├── education-editor.tsx
│   │       │   │   ├── experience-editor.tsx
│   │       │   │   ├── interests-editor.tsx
│   │       │   │   ├── languages-editor.tsx
│   │       │   │   ├── projects-editor.tsx
│   │       │   │   ├── references-editor.tsx
│   │       │   │   ├── section-header.tsx
│   │       │   │   ├── skills-editor.tsx
│   │       │   │   └── summary-editor.tsx
│   │       │   └── theme-editor.tsx
│   │       └── preview/
│   │           ├── preview-canvas.tsx
│   │           ├── resume-page.tsx
│   │           └── templates/
│   │               └── nova-template.tsx
│   ├── hooks/
│   │   └── use-media-query.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── ai-providers.ts
│   │   │   ├── ai-suggest.ts
│   │   │   ├── ats.ts
│   │   │   ├── auth.ts
│   │   │   ├── client.ts
│   │   │   ├── dashboard.ts
│   │   │   └── resumes.ts
│   │   ├── auth/
│   │   │   └── token-manager.ts
│   │   ├── features/
│   │   │   ├── ai/
│   │   │   │   └── aiSlice.ts
│   │   │   ├── ats/
│   │   │   │   └── atsSlice.ts
│   │   │   ├── auth/
│   │   │   │   └── authSlice.ts
│   │   │   ├── resume/
│   │   │   │   └── resumeSlice.ts
│   │   │   └── ui/
│   │   │       └── uiSlice.ts
│   │   ├── hooks.ts
│   │   ├── store.ts
│   │   ├── template-registry.ts
│   │   └── utils.ts
│   ├── providers/
│   │   ├── redux-provider.tsx
│   │   └── theme-provider.tsx
│   ├── schemas/
│   │   └── resume.ts
│   ├── store/
│   │   └── resume-store.ts
│   └── types/
│       ├── design.ts
│       ├── resume.ts
│       └── template.ts
├── tailwind.config.ts
└── tsconfig.json
resume-builder-print.png
resume-builder-screen.png
```

---

## File Descriptions

### Root Level

| File | Description |
|------|-------------|
| `AGENTS.md` | Agent instructions for the project — describes architecture, commands, gotchas, and session history for AI coding assistants |
| `CLAUDE.md` | Primary architecture overview and workflow reference for Claude/Cursor agents |
| `README.md` | Project README with setup instructions |
| `.gitignore` | Git ignore rules for both backend and frontend |
| `.vscode/launch.json` | VS Code debugger launch configuration |
| `.opencode/` | OpenCode agent workspace configuration and packages |
| `.agent/skills/fastapi-helper/SKILL.md` | AI agent skill definition for FastAPI development |
| `resume-builder-print.png` | Screenshot of the resume builder (print view) |
| `resume-builder-screen.png` | Screenshot of the resume builder (screen view) |

---

### Backend (`backend/`)

#### Configuration

| File | Description |
|------|-------------|
| `backend/.env` | Environment variables for local development (gitignored — contains secrets) |
| `backend/.env.example` | Template for `.env` with required fields documented |
| `backend/pyproject.toml` | Project metadata, dependencies (FastAPI, SQLAlchemy, asyncpg, PyMuPDF, etc.), dev dependencies (pytest, ruff, mypy), and pytest/ruff tool config |
| `backend/requirements.txt` | Pinned dependency versions (alternative to pyproject.toml) |
| `backend/alembic.ini` | Alembic migration configuration (sync DB URL derived from async) |
| `backend/API.md` | Comprehensive API documentation (~1366 lines) — endpoint reference, request/response schemas, authentication flow, and error codes |

#### `backend/app/` — Application Core

##### Entry Point

| File | Description |
|------|-------------|
| `backend/app/main.py` | FastAPI app entry point. Creates the app with lifespan (DB health check + schema creation), configures middleware stack (SlowAPI rate limiter, AuthMiddleware, ErrorHandlerMiddleware, CORSMiddleware), registers all routers under `/api/v1/`, and exposes health/ready endpoints. OpenAPI docs only in development mode. |

##### Config (`backend/app/config/`)

| File | Description |
|------|-------------|
| `backend/app/config/settings.py` | Pydantic BaseSettings — loads from `.env`. Requires `SECRET_KEY`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`. App crashes on startup if required fields are missing. |
| `backend/app/config/database.py` | Async SQLAlchemy engine & session factory. Creates `AsyncSession` via `async_sessionmaker`, provides `get_db` FastAPI dependency. |

##### Middleware (`backend/app/middleware/`)

| File | Description |
|------|-------------|
| `backend/app/middleware/auth.py` | AuthMiddleware — non-blocking JWT decode. Sets `request.state.user_id` (or None) from `Authorization: Bearer <token>`. |
| `backend/app/middleware/error_handler.py` | ErrorHandlerMiddleware — wraps all responses in `{success, data, error}` shape. Includes `validation_exception_handler` for Pydantic validation errors. |

##### Modules (`backend/app/modules/`)

Each module follows the pattern: `router.py` -> `service.py` -> `models.py` + `schemas.py` (Pydantic v2).

**Auth Module** (`backend/app/modules/auth/`)

| File | Description |
|------|-------------|
| `router.py` | Auth routes: `POST /signup`, `POST /login`, `POST /refresh`, `POST /logout`, `POST /forgot-password`, `POST /reset-password`, `GET /verify-email` |
| `service.py` | Auth business logic — user creation, password verification, token management |
| `models.py` | SQLAlchemy models: `User`, `RefreshToken` (SHA-256 hashed) |
| `schemas.py` | Pydantic schemas: `SignupRequest`, `LoginRequest`, `TokenResponse`, etc. |
| `utils.py` | Utility functions: email normalization, token generation helpers |
| `exceptions.py` | Auth-specific exception classes |
| `EXCEPTION_PLAN.md` | Documented exception handling strategy for the auth module |

**Users Module** (`backend/app/modules/users/`)

| File | Description |
|------|-------------|
| `router.py` | User routes: `GET /me`, `PATCH /me`, `PATCH /me/password`, `DELETE /me` |
| `service.py` | User profile CRUD, password change, account deletion |
| `models.py` | SQLAlchemy model: `User` (extends auth user with profile fields) |
| `schemas.py` | Pydantic schemas: `UserOut`, `UserUpdate`, `PasswordChange` |

**Resumes Module** (`backend/app/modules/resumes/`)

| File | Description |
|------|-------------|
| `router.py` | Resume routes: CRUD operations + upload/export endpoints |
| `service.py` | Resume business logic — create, read, update, delete, upload PDF/DOCX, export to PDF/DOCX |
| `models.py` | SQLAlchemy model: `Resume` with JSON `data` field for structured resume content |
| `schemas.py` | Pydantic schemas: `ResumeCreate`, `ResumeUpdate`, `ResumeResponse` |
| `export.py` | Export functionality — PDF generation via WeasyPrint, DOCX generation via python-docx |
| `templates/` | HTML/CSS templates for PDF rendering: `default.html`, `modern.html`, `classic.html`, `creative.html`, `minimal.html` |

**AI Module** (`backend/app/modules/ai/`)

| File | Description |
|------|-------------|
| `router.py` | AI routes: `POST /suggest-summary`, `POST /suggest-skills`, `POST /suggest-experience`, `POST /generate-resume` |
| `service.py` | AI service orchestration — calls the configured provider, processes prompts, returns structured results |
| `models.py` | SQLAlchemy model: `AISuggestion` (audit log of AI suggestions) |
| `schemas.py` | Pydantic schemas: `SuggestSummaryRequest`, `SuggestSkillsRequest`, `GenerateResumeRequest` |
| `prompts.py` | Prompt templates for various AI tasks (summary generation, skills extraction, experience rewriting) |
| `providers/` | AI provider adapters: |
| `providers/openai_compatible.py` | OpenAI-compatible API adapter (OpenAI, Together, etc.) |
| `providers/anthropic.py` | Anthropic Claude API adapter |
| `providers/gemini.py` | Google Gemini API adapter |
| `providers/nvidia_nim.py` | NVIDIA NIM API adapter |

**AI Providers Module** (`backend/app/modules/ai_providers/`)

| File | Description |
|------|-------------|
| `router.py` | Provider settings routes: `GET /`, `POST /`, `PATCH /{id}`, `DELETE /{id}`, `POST /{id}/verify`. Manages API keys (encrypted with AES-256-GCM), base URLs, and model selections. |

**ATS Module** (`backend/app/modules/ats/`)

| File | Description |
|------|-------------|
| `router.py` | ATS routes: `POST /scan`, `GET /scans/{id}`, `GET /scans` |
| `service.py` | ATS scoring logic — analyzes resume against job descriptions, calculates format/keyword/readability/completeness scores |
| `models.py` | SQLAlchemy model: `ATSScan` with JSON `score_report` |
| `schemas.py` | Pydantic schemas: `ScanRequest`, `ScanResult`, `ScoreReport` |

##### Types (`backend/app/types/`)

| File | Description |
|------|-------------|
| `backend/app/types/common.py` | Shared type definitions — standard API response wrappers, common enums |

##### Utilities (`backend/app/utils/`)

| File | Description |
|------|-------------|
| `ai.py` | AI utility helpers — model name resolution, provider routing |
| `auth.py` | Authentication helpers — dependency injection for `get_current_user` |
| `docx_injector.py` | DOCX injection — wrapper around `template_builder.py` for creating resume DOCX files from uploaded content |
| `email.py` | Email utility — email content builders (verification, password reset) |
| `email_sender.py` | Async email sender via `aiosmtplib` |
| `encryption.py` | AES-256-GCM encryption/decryption for AI provider API keys |
| `jwt.py` | JWT creation and verification (HS256, separate access/refresh secrets) |
| `ownership.py` | `assert_ownership()` helper — returns 404 to prevent resource enumeration |
| `password.py` | Password hashing and verification via bcrypt |
| `pdf_exporter.py` | PDF generation from HTML templates using WeasyPrint |
| `pdf_parser.py` | PDF text extraction using PyMuPDF (fitz) |
| `style_extractor.py` | Style extraction from uploaded DOCX files (fonts, colors, formatting) |
| `template_builder.py` | Programmatic Base-Nova DOCX builder — builds .docx from scratch using python-docx with Karla font, brand color `#00FFF0`, proper formatting |
| `token.py` | Refresh token generation and validation (SHA-256 hashed in DB) |

##### Migrations (`backend/alembic/`)

| File | Description |
|------|-------------|
| `alembic/env.py` | Alembic environment config — converts async `DATABASE_URL` to sync for migration compatibility |
| `alembic/versions/` | Migration versions: |
| `20240614_add_auth_constraints.py` | Adds auth constraints (unique email, etc.) |
| `20240616_add_model_to_ai_providers_and_ats_scans.py` | Adds model field to AI providers & ATS scans |
| `20240617_add_original_file_fields_to_resumes.py` | Adds original filename/content-type fields to resumes |
| `20250619_add_skill_groups_to_resume_data.py` | Adds skill groups to resume JSON data |
| `20250619_add_template_style_to_resume_data.py` | Adds template style to resume JSON data |
| `20250620_add_injected_file_path_to_resumes.py` | Adds injected file path field to resumes |

##### Tests (`backend/tests/`)

| File | Description |
|------|-------------|
| `conftest.py` | Test configuration — replaces app lifespan with noop, mocks DB via `AsyncMock`, overrides `get_db` and `get_current_user` dependencies |
| `test_ai_providers.py` | Tests for AI provider CRUD and verification |
| `test_ai_suggest.py` | Tests for AI suggestion endpoints |
| `test_ats_score.py` | Tests for ATS scoring functionality |

---

### Frontend (`frontend/`)

#### Configuration

| File | Description |
|------|-------------|
| `frontend/.env.local` | Frontend environment variables |
| `frontend/package.json` | Dependencies: Next.js 15, React 19, Redux Toolkit, @dnd-kit (drag-and-drop), shadcn/ui, Tailwind CSS, Zod, Zustand, and more |
| `frontend/next.config.ts` | Next.js configuration |
| `frontend/tailwind.config.ts` | Tailwind CSS configuration — brand color `#00FFF0`, custom fonts (Space Grotesk for headings, DM Sans for body), custom animations, sidebar theme colors, rounded corner presets |
| `frontend/postcss.config.mjs` | PostCSS configuration (Tailwind + autoprefixer) |
| `frontend/tsconfig.json` | TypeScript configuration |
| `frontend/eslint.config.mjs` | ESLint configuration (flat config) |
| `frontend/components.json` | shadcn/ui components configuration |
| `frontend/frontend-structure.md` | Frontend-specific structure documentation |

#### `frontend/src/app/` — Page Routes

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout — sets up Space Grotesk + DM Sans fonts, wraps content in ReduxProvider, ThemeProvider, and UnauthorizedOverlay. Dark mode via `next-themes`. |
| `page.tsx` | Landing page — renders PublicNavbar, Hero, TrustBar, Features, HowItWorks, Pricing, CTA, and Footer sections |
| `globals.css` | Global CSS — Tailwind directives, CSS custom properties for light/dark themes, shadcn/ui base styles |
| `login/page.tsx` | Login page |
| `signup/page.tsx` | Signup page |
| `forgot-password/page.tsx` | Password reset initiation page |
| `reset-password/page.tsx` | Password reset completion page |
| `dashboard/page.tsx` | Dashboard page (main app view after login) |
| `dashboard/dashboard-home.tsx` | Dashboard home content component |
| `resume/page.tsx` | Resume list/index page |
| `resume/resume-page.tsx` | Resume detail page component |
| `resume/new/page.tsx` | Resume creator page (new resume) |
| `resume/new/resume-builder.tsx` | Main resume builder component |
| `profile/page.tsx` | User profile page |
| `profile/profile-page.tsx` | Profile page content component |
| `settings/ai/page.tsx` | AI provider settings page |
| `settings/ai/ai-settings.tsx` | AI settings configuration component |
| `ai-generator/page.tsx` | Standalone AI generator page |
| `ai-generator/ai-generator.tsx` | AI generator component |
| `ats-score/page.tsx` | ATS score page |

#### `frontend/src/components/` — Reusable Components

| File | Description |
|------|-------------|
| **Auth Components** | |
| `auth/auth-guard.tsx` | Route protection wrapper — redirects unauthenticated users |
| `auth/unauthorized-overlay.tsx` | Overlay shown on 401 responses |
| **Landing Components** | |
| `landing/public-navbar.tsx` | Public landing page navigation bar |
| `landing/hero.tsx` | Landing page hero section |
| `landing/features.tsx` | Features showcase section |
| `landing/how-it-works.tsx` | How-it-works steps section |
| `landing/pricing.tsx` | Pricing plans section |
| `landing/cta.tsx` | Call-to-action section |
| `landing/footer.tsx` | Landing page footer |
| `landing/trust-bar.tsx` | Trust/logos bar section |
| `landing/landing-resume-preview.tsx` | Resume preview showcase on landing |
| **Layout Components** | |
| `layout/dashboard-shell.tsx` | Dashboard layout shell (sidebar + navbar + content) |
| `layout/navbar.tsx` | Dashboard navigation bar |
| `layout/sidebar.tsx` | Dashboard sidebar navigation |
| `layout/theme-toggle.tsx` | Dark/light mode toggle |
| **UI Components (shadcn/ui style)** | |
| `ui/button.tsx` | Button component with variants |
| `ui/input.tsx` | Form input component |
| `ui/textarea.tsx` | Textarea component |
| `ui/select.tsx` | Select dropdown component |
| `ui/dialog.tsx` | Modal dialog component |
| `ui/alert-dialog.tsx` | Alert/confirmation dialog |
| `ui/sheet.tsx` | Side panel (sheet) component |
| `ui/accordion.tsx` | Accordion component |
| `ui/tabs.tsx` | Tabs component |
| `ui/badge.tsx` | Badge component |
| `ui/avatar.tsx` | Avatar component |
| `ui/dropdown-menu.tsx` | Dropdown menu component |
| `ui/skeleton.tsx` | Loading skeleton component |
| `ui/enhanced-card.tsx` | Enhanced card component |
| `ui/stat-card.tsx` | Statistics card component |
| `ui/file-upload.tsx` | File upload component (PDF/DOCX) |

#### `frontend/src/features/` — Feature Modules

| File | Description |
|------|-------------|
| **Auth Features** | |
| `auth/login-form.tsx` | Login form with validation |
| `auth/signup-form.tsx` | Signup form with validation |
| `auth/forgot-password-form.tsx` | Forgot password form |
| `auth/reset-password-form.tsx` | Reset password form |
| `auth/auth-layout.tsx` | Shared layout for auth pages |
| **Resume Features** | |
| `resume/types.ts` | Resume data type definitions |
| `resume/editor-panel.tsx` | Resume editor panel component |
| `resume/preview-panel.tsx` | Resume preview panel component |
| `resume/form-section.tsx` | Reusable form section component |
| `resume/resume-list-item.tsx` | Resume list item component |
| `resume/resume-preview.tsx` | Resume preview display |
| `resume/template-switcher.tsx` | Template selection switcher |
| `resume/score-gauge.tsx` | ATS score gauge visualization |
| `resume/tag-input.tsx` | Tag/skills input component |
| **Resume Builder Features** | |
| `resume-builder/builder-layout.tsx` | Resume builder layout |
| `resume-builder/editor/editor-panel.tsx` | Builder editor panel |
| `resume-builder/editor/dnd-section-list.tsx` | Drag-and-drop section list |
| `resume-builder/editor/theme-editor.tsx` | Theme/style editor |
| `resume-builder/editor/sections/contact-editor.tsx` | Contact section editor form |
| `resume-builder/editor/sections/summary-editor.tsx` | Professional summary editor |
| `resume-builder/editor/sections/experience-editor.tsx` | Work experience editor |
| `resume-builder/editor/sections/education-editor.tsx` | Education editor |
| `resume-builder/editor/sections/skills-editor.tsx` | Skills editor |
| `resume-builder/editor/sections/projects-editor.tsx` | Projects editor |
| `resume-builder/editor/sections/certifications-editor.tsx` | Certifications editor |
| `resume-builder/editor/sections/languages-editor.tsx` | Languages editor |
| `resume-builder/editor/sections/awards-editor.tsx` | Awards editor |
| `resume-builder/editor/sections/interests-editor.tsx` | Interests editor |
| `resume-builder/editor/sections/references-editor.tsx` | References editor |
| `resume-builder/editor/sections/section-header.tsx` | Section header component |
| `resume-builder/preview/preview-canvas.tsx` | Preview canvas component |
| `resume-builder/preview/resume-page.tsx` | Preview page component |
| `resume-builder/preview/templates/nova-template.tsx` | Nova template renderer |
| **AI Features** | |
| `ai/ai-suggest-button.tsx` | AI suggestion trigger button |
| **ATS Features** | |
| `ats/ats-score-page.tsx` | ATS score display page |

#### `frontend/src/lib/` — Shared Libraries

| File | Description |
|------|-------------|
| **API Client** | |
| `lib/api/client.ts` | Core API client — wraps `fetch` with JWT auth, automatic token refresh on 401, timeout handling (5 min), structured error parsing, helper methods for GET/POST/PATCH/DELETE/upload/download/fetchHtml |
| `lib/api/auth.ts` | Auth API functions — signup, login, logout, refresh, forgot/reset password, verify email |
| `lib/api/resumes.ts` | Resume API functions — CRUD operations, upload, export, duplicate |
| `lib/api/ai-providers.ts` | AI provider settings API — list, create, update, delete, verify |
| `lib/api/ai-suggest.ts` | AI suggestion API — suggest summary, skills, experience, generate resume |
| `lib/api/ats.ts` | ATS API — scan resume, get scan results |
| `lib/api/dashboard.ts` | Dashboard API — aggregated dashboard data |
| **Auth** | |
| `lib/auth/token-manager.ts` | JWT access token management (localStorage get/set/clear) |
| **State (Redux Toolkit)** | |
| `lib/store.ts` | Redux store configuration — combines slices: auth, resume, ui, ai, ats |
| `lib/hooks.ts` | Typed Redux hooks: `useAppDispatch`, `useAppSelector` |
| `lib/features/auth/authSlice.ts` | Auth state slice (user, isAuthenticated, loading) |
| `lib/features/resume/resumeSlice.ts` | Resume state slice (list, current, editing) |
| `lib/features/ui/uiSlice.ts` | UI state slice (sidebar, theme, modals) |
| `lib/features/ai/aiSlice.ts` | AI state slice (suggestions, loading, providers) |
| `lib/features/ats/atsSlice.ts` | ATS state slice (scans, scores, results) |
| **Other** | |
| `lib/utils.ts` | Utility functions (cn() for Tailwind class merging) |
| `lib/template-registry.ts` | Resume template registry |
| `store/resume-store.ts` | Zustand-based resume store (alternative state management) |

#### `frontend/src/providers/`

| File | Description |
|------|-------------|
| `providers/redux-provider.tsx` | Redux Provider wrapper component |
| `providers/theme-provider.tsx` | Theme provider (dark mode via next-themes) |

#### `frontend/src/types/`

| File | Description |
|------|-------------|
| `types/resume.ts` | Resume TypeScript type definitions |
| `types/design.ts` | Design/theme type definitions |
| `types/template.ts` | Template type definitions |

#### `frontend/src/schemas/`

| File | Description |
|------|-------------|
| `schemas/resume.ts` | Zod validation schemas for resume forms |

#### `frontend/src/hooks/`

| File | Description |
|------|-------------|
| `hooks/use-media-query.ts` | Responsive media query hook |

#### `frontend/src/contexts/`

| File | Description |
|------|-------------|
| `contexts/sidebar-context.tsx` | Sidebar open/close state context |

---

### Docs (`docs/`)

| File | Description |
|------|-------------|
| `docs/instruction.md` | Full-stack project blueprint & prompt sheet (~1580 lines). Covers MERN+TypeScript best practices, security checklists, folder structure, API documentation standards, version safety rules. The canonical reference for project architecture decisions. |
| `docs/DESIGN.md` | Design documentation — UI/UX decisions, component architecture |
| `docs/GenerativeCV_PRD.md` | Product requirements document — feature specifications, user stories, acceptance criteria |
| `docs/design-system.md` | Design system documentation — colors, typography, component usage guidelines |

---

## Architecture Summary

### Backend (FastAPI)

Request flow:
```
Request -> CORSMiddleware -> SlowAPIMiddleware -> AuthMiddleware -> ErrorHandlerMiddleware -> Router -> Service -> Model/Schema
```

- **Router layer** (`modules/*/router.py`): HTTP endpoint definitions, request validation, response serialization
- **Service layer** (`modules/*/service.py`): Business logic, orchestration, external API calls
- **Model layer** (`modules/*/models.py`): SQLAlchemy ORM models
- **Schema layer** (`modules/*/schemas.py`): Pydantic v2 request/response schemas
- **Utils** (`utils/`): Shared utilities (JWT, encryption, PDF processing, email, etc.)
- **Middleware** (`middleware/`): Rate limiting, auth, error handling, CORS

### Frontend (Next.js 15 + React 19)

Data flow:
```
Page (app/) -> Feature Component (features/) -> UI Component (components/ui/) -> API Client (lib/api/) -> Backend
```

- **Pages** (`app/`): Next.js App Router pages and layouts
- **Features** (`features/`): Domain-specific feature modules (auth, resume, resume-builder, ai, ats)
- **Components** (`components/`): Reusable UI components (auth, landing, layout, shadcn/ui)
- **Lib** (`lib/`): API client, Redux store, typed hooks, utilities, auth token management
- **State**: Redux Toolkit (5 slices: auth, resume, ui, ai, ats) + optional Zustand store
