# Generative-CV — Product Requirements Document (PRD)

> **Version:** 1.0
> **Product:** Generative-CV (AI-Powered Resume Builder SaaS)
> **Brand Color:** `#00FFF0` (Cyan/Teal)
> **Theme:** Dark / Light Toggle
> **Status:** Pre-Development

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Pages & Routes](#4-pages--routes)
5. [Feature Modules](#5-feature-modules)
6. [Database Schema (PostgreSQL)](#6-database-schema-postgresql)
7. [API Endpoints (FastAPI)](#7-api-endpoints-fastapi)
8. [Environment Variables](#8-environment-variables)
9. [Security Checklist](#9-security-checklist)
10. [Frontend Architecture](#10-frontend-architecture)
11. [AI Integration Layer](#11-ai-integration-layer)
12. [Component Architecture](#12-component-architecture)
13. [Deployment Plan](#13-deployment-plan)

---

## 1. Product Overview

### Vision
Generative-CV is an AI-powered resume builder SaaS that lets users create, customize, and optimize resumes using multiple LLM providers via their own API keys. Users bring their own AI — the platform orchestrates it.

### Core Value Props
- AI suggestions for every resume section (summary, skills, experience, projects)
- Multi-provider AI support (Anthropic, Google Gemini, NVIDIA NIM, etc.) — user's own key
- ATS score checker — AI-analyzed, not regex-based
- Side-by-side live preview with multiple resume templates
- Existing resume upload → auto-scan → populate form

### Target Users
- Job seekers optimizing resumes for specific JDs
- Freshers building first resumes
- Professionals switching roles

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) | SSR + CSR hybrid |
| **Styling** | Tailwind CSS v3+ | Dark/Light via `class` strategy |
| **Language** | TypeScript | Strict mode |
| **Backend** | FastAPI (Python 3.12+) | Async, type-safe |
| **Database** | PostgreSQL | via SQLAlchemy + Alembic |
| **Auth** | Email/Password (JWT) | Access + Refresh token pattern |
| **AI Layer** | Multi-provider proxy | Anthropic, Gemini, NVIDIA NIM |
| **PDF Parse** | PyMuPDF / pdfplumber | Resume upload → text extract |
| **PDF Export** | WeasyPrint / ReportLab | Resume → downloadable PDF |
| **File Storage** | Supabase Storage / S3 | Resume uploads, avatars |
| **Deploy: Frontend** | Vercel | NEXT_PUBLIC_* env vars in dashboard |
| **Deploy: Backend** | Render / Railway | ENV vars via platform |
| **Deploy: DB** | Supabase PostgreSQL / Neon | Connection pooling enabled |

### Token Lifetime Standard
- **Access JWT:** `15 minutes` — `Authorization: Bearer` header
- **Refresh token:** `7 days` — `HttpOnly; Secure; SameSite=Strict` cookie

---

## 3. Repository Structure

```
generative-cv/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app init + middleware + router mount
│   │   ├── config/
│   │   │   ├── settings.py            # Pydantic BaseSettings — crash on bad config
│   │   │   └── database.py            # SQLAlchemy engine + session
│   │   ├── middleware/
│   │   │   ├── auth.py                # JWT verify → attach request.state.user
│   │   │   └── error_handler.py       # Global exception → standard JSON
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py         # Pydantic request/response models
│   │   │   │   └── models.py          # SQLAlchemy ORM models
│   │   │   ├── users/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   ├── resumes/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   ├── ai/
│   │   │   │   ├── router.py          # AI suggestion endpoints
│   │   │   │   ├── service.py         # Provider routing logic
│   │   │   │   ├── providers/
│   │   │   │   │   ├── anthropic.py
│   │   │   │   │   ├── gemini.py
│   │   │   │   │   └── nvidia_nim.py
│   │   │   │   └── prompts.py         # All LLM system prompts
│   │   │   └── ats/
│   │   │       ├── router.py
│   │   │       └── service.py
│   │   ├── utils/
│   │   │   ├── jwt.py                 # create_access_token, create_refresh_token, verify
│   │   │   ├── password.py            # bcrypt hash + verify
│   │   │   ├── encryption.py          # AES-256 for stored API keys
│   │   │   ├── pdf_parser.py          # PyMuPDF resume text extractor
│   │   │   └── pdf_exporter.py        # WeasyPrint resume → PDF
│   │   └── types/
│   │       └── common.py              # Shared Pydantic base models
│   ├── alembic/                       # DB migrations
│   ├── .env.example
│   ├── requirements.txt
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── app/                       # Next.js App Router pages
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx           # Landing page
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   ├── about/page.tsx
│   │   │   │   └── contact/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx         # Protected layout with sidebar
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── resume/
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── ai-generator/page.tsx
│   │   │   │   ├── ats-score/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── ai/page.tsx    # API provider settings
│   │   │   ├── layout.tsx             # Root layout
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                    # Base design system
│   │   │   ├── resume/
│   │   │   │   ├── ResumeForm.tsx
│   │   │   │   ├── ResumePreview.tsx
│   │   │   │   ├── TemplateSelector.tsx
│   │   │   │   └── templates/
│   │   │   │       ├── ClassicTemplate.tsx
│   │   │   │       ├── ModernTemplate.tsx
│   │   │   │       ├── MinimalTemplate.tsx
│   │   │   │       └── CreativeTemplate.tsx
│   │   │   ├── ai/
│   │   │   │   └── AISuggestButton.tsx
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── ThemeToggle.tsx
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── client.ts          # Axios instance + interceptors
│   │   │   │   └── refreshClient.ts   # Separate refresh instance
│   │   │   ├── auth/
│   │   │   │   ├── AuthProvider.tsx
│   │   │   │   └── tokenStore.ts      # In-memory token only
│   │   │   └── hooks/
│   │   │       ├── useResume.ts
│   │   │       └── useAISuggest.ts
│   │   └── types/
│   │       └── resume.ts
│   ├── .env.example
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
└── docs/
    └── PRD.md                         # This file
```

---

## 4. Pages & Routes

### Public Routes (No Auth Required)

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, features, CTA, pricing teaser |
| `/login` | Login | Email + password, link to signup |
| `/signup` | Signup | Email + password + name |
| `/about` | About | Product story, team |
| `/contact` | Contact | Contact form |

### Protected Routes (Auth Required)

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Home/Dashboard | Resume list, quick actions |
| `/resume/new` | New Resume | Template select → form + preview |
| `/resume/[id]` | Edit Resume | Form + live preview side-by-side |
| `/ai-generator` | AI Resume Gen | JD input + existing resume → AI tailored output |
| `/ats-score` | ATS Checker | Upload resume → get ATS score + feedback |
| `/profile` | Profile | Name, email, avatar, password change |
| `/settings/ai` | AI Settings | Provider select, API key input + verify + save |

### Route Guards
- All `/dashboard`, `/resume/*`, `/ai-generator`, `/ats-score`, `/profile`, `/settings/*` → `RequireAuth` middleware
- Redirect to `/login?from=<original-route>` on fail

---

## 5. Feature Modules

### 5.1 Authentication Module

**Flows:**
1. **Signup** — name + email + password → verify email → access granted
2. **Login** — email + password → JWT access (15min) + refresh cookie (7d)
3. **Logout** — clear refresh cookie + invalidate DB token
4. **Refresh** — refresh cookie → new access token (rotation)
5. **Forgot Password** — email → OTP/link → reset

**Security rules:**
- bcrypt cost factor ≥ 10
- Refresh token hashed in DB (never stored raw)
- Account lock after 5 failed attempts → 15min lockout
- Generic error messages — never reveal if email exists

### 5.2 Resume Builder Module

**Sub-features:**

**A. Template Selection**
- 4+ templates: Classic, Modern, Minimal, Creative
- Preview thumbnails in modal/sidebar
- Can switch template at any time — data preserved

**B. Resume Form (User Input)**

| Section | Fields | AI Assist |
|---|---|---|
| Personal | first-name, last-name, job-title, email, mobile, address, pincode | job-title suggest |
| Links | github, linkedin, portfolio | — |
| Summary | textarea | AI generate / improve |
| Skills | tag input | AI suggest skills for role |
| Experience | company, role, duration, bullets | AI improve bullets |
| Projects | name, description, link (live), tech-stack | AI improve description |
| Education | institution, degree, year, grade | — |
| Certifications | name, issuer, year, link | — |
| Custom Section | label + content | — |

**C. Live Preview**
- Side-by-side layout (form left, preview right)
- Real-time re-render on every field change
- Mobile: toggle form/preview tabs

**D. Existing Resume Upload**
- Upload PDF/DOCX → backend parses text → AI extracts structured data → populates form
- All fields editable after population

**E. Export**
- Download as PDF (preserves template styling)
- Download as DOCX (basic formatting)

### 5.3 AI Resume Generator Module

**Flow:**
1. User pastes Job Description
2. Optionally uploads existing resume
3. AI analyzes JD → modifies/generates:
   - Job title (matched to JD)
   - Professional summary (JD-tailored)
   - Skills list (JD-matched, gap-filled)
   - Experience bullets (action-verb enhanced)
   - Projects (relevance re-framed)
4. Output shown in editable form + preview
5. User can accept/reject per-section suggestions

**AI Call Pattern:**
- One structured prompt per section (parallel calls for speed)
- Provider selected from user's saved AI settings
- Fallback: if user has no API key → prompt to add one

### 5.4 ATS Score Checker Module

**Flow:**
1. User uploads resume PDF
2. Optionally pastes target Job Description
3. Backend:
   - Parses resume text
   - Sends to AI: score resume + return JSON report
4. Display:
   - Overall ATS score (0-100)
   - Section-wise scores
   - Missing keywords list
   - Improvement suggestions
   - Readability rating

**AI Prompt Output Format (JSON):**
```json
{
  "overall_score": 72,
  "section_scores": {
    "format": 85,
    "keywords": 60,
    "readability": 75,
    "completeness": 80
  },
  "missing_keywords": ["Docker", "CI/CD", "PostgreSQL"],
  "suggestions": [
    "Add quantified achievements to experience bullets",
    "Include more JD-specific keywords in summary"
  ]
}
```

### 5.5 AI Settings Module

**Flow:**
1. User selects provider: Anthropic | Google Gemini | NVIDIA NIM | Custom URL
2. Inputs API key (or base URL for custom)
3. Click "Verify" → backend pings provider with minimal test call
4. On success → save (encrypted AES-256 in DB)
5. Multiple providers saveable — user selects default

**Providers supported:**
- `anthropic` → `api.anthropic.com/v1`
- `gemini` → `generativelanguage.googleapis.com`
- `nvidia-nim` → `integrate.api.nvidia.com/v1`
- `custom` → user-supplied base URL (OpenAI-compatible)

### 5.6 Profile Module

- Update: name, job title, avatar
- Change password (current + new + confirm)
- View: account created date, resume count
- Delete account (confirmation text required)

---

## 6. Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Refresh tokens (hashed, rotated)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AI provider settings (api key stored encrypted)
CREATE TABLE ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,   -- anthropic | gemini | nvidia-nim | custom
    api_key_encrypted TEXT NOT NULL,       -- AES-256-GCM encrypted
    base_url TEXT,                         -- for custom/nvidia providers
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, provider_name)
);

-- Resumes
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,           -- user-defined resume name
    template_id VARCHAR(100) NOT NULL,     -- classic | modern | minimal | creative
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Resume data (JSONB for flexible structure)
CREATE TABLE resume_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    personal JSONB,         -- name, email, mobile, address, links, job_title
    summary TEXT,
    skills JSONB,           -- string[]
    experience JSONB,       -- array of experience objects
    projects JSONB,         -- array of project objects
    education JSONB,        -- array of education objects
    certifications JSONB,   -- array of cert objects
    custom_sections JSONB,  -- array of {label, content}
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ATS scan history
CREATE TABLE ats_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id),
    job_description TEXT,
    score_report JSONB,     -- full AI report JSON
    overall_score INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Email verification + password reset tokens
CREATE TABLE email_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,   -- verify_email | reset_password
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_resumes_user ON resumes(user_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_ai_providers_user ON ai_providers(user_id);
CREATE INDEX idx_ats_scans_user ON ats_scans(user_id);
```

---

## 7. API Endpoints (FastAPI)

### Response Shape Standard

```json
// Success
{ "success": true, "data": { ... } }

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable",
    "fields": { "field": ["error msg"] }
  }
}
```

### Error Codes

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Pydantic validation failed |
| 400 | `INVALID_REQUEST` | Logically invalid |
| 401 | `UNAUTHORIZED` | No token |
| 401 | `TOKEN_EXPIRED` | Access expired → refresh |
| 401 | `TOKEN_INVALID` | Tampered token |
| 401 | `INVALID_CREDENTIALS` | Wrong email/pass |
| 403 | `FORBIDDEN` | Wrong user resource |
| 403 | `ACCOUNT_LOCKED` | Too many failed logins |
| 404 | `NOT_FOUND` | Resource not found / wrong user |
| 409 | `CONFLICT` | Email already exists |
| 422 | `AI_PROVIDER_ERROR` | LLM API call failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

### Auth Endpoints

```
POST   /api/v1/auth/signup           → register user
POST   /api/v1/auth/login            → email + password → tokens
POST   /api/v1/auth/logout           → clear refresh cookie + DB
POST   /api/v1/auth/refresh          → refresh cookie → new access token
POST   /api/v1/auth/forgot-password  → send reset email
POST   /api/v1/auth/reset-password   → token + new password
GET    /api/v1/auth/verify-email     → ?token=... → activate account
```

### User Endpoints

```
GET    /api/v1/users/me              → current user profile
PATCH  /api/v1/users/me             → update name, avatar
PATCH  /api/v1/users/me/password    → change password
DELETE /api/v1/users/me             → delete account (confirm text required)
```

### Resume Endpoints

```
GET    /api/v1/resumes               → list user resumes (paginated)
POST   /api/v1/resumes               → create new resume
GET    /api/v1/resumes/{id}          → get resume detail
PATCH  /api/v1/resumes/{id}         → update resume data / template
DELETE /api/v1/resumes/{id}         → soft delete
POST   /api/v1/resumes/{id}/export  → download PDF
POST   /api/v1/resumes/upload-scan  → upload PDF/DOCX → extract → return structured JSON
```

### AI Endpoints

```
POST   /api/v1/ai/suggest/summary         → generate summary from skills + JD
POST   /api/v1/ai/suggest/skills          → suggest skills for role
POST   /api/v1/ai/suggest/experience      → improve experience bullets
POST   /api/v1/ai/suggest/projects        → improve project descriptions
POST   /api/v1/ai/generate-resume         → full AI resume gen from JD + existing data
```

### AI Settings Endpoints

```
GET    /api/v1/settings/ai               → list user's saved providers
POST   /api/v1/settings/ai               → add provider + key
PATCH  /api/v1/settings/ai/{id}         → update / set default
DELETE /api/v1/settings/ai/{id}         → remove provider
POST   /api/v1/settings/ai/verify       → test API key → return {valid: bool}
```

### ATS Endpoints

```
POST   /api/v1/ats/score                 → upload resume + optional JD → score report
GET    /api/v1/ats/history               → list past scans
GET    /api/v1/ats/history/{id}          → single scan result
```

### Health Endpoints

```
GET    /health                            → 200 if process alive (no DB)
GET    /ready                             → 200 if DB connected, 503 if not
```

---

## 8. Environment Variables

### Backend `.env.example`

```env
# ── Server ────────────────────────────────────────────────
APP_ENV=development
PORT=8000
SECRET_KEY=replace_with_64_char_hex_secret

# ── Database ──────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/generative_cv

# ── JWT ───────────────────────────────────────────────────
# Generate: python -c "import secrets; print(secrets.token_hex(64))"
JWT_ACCESS_SECRET=replace_with_64_char_hex
JWT_REFRESH_SECRET=replace_with_different_64_char_hex
JWT_ACCESS_EXPIRE_MINUTES=15
JWT_REFRESH_EXPIRE_DAYS=7

# ── API Key Encryption ────────────────────────────────────
# Generate: python -c "import secrets; print(secrets.token_hex(32))"
ENCRYPTION_KEY=replace_with_32_byte_hex

# ── CORS ──────────────────────────────────────────────────
CORS_ORIGINS=http://localhost:3000

# ── File Storage ──────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
STORAGE_BUCKET=resume-uploads

# ── Email (SMTP) ───────────────────────────────────────────
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_smtp_api_key
EMAIL_FROM=noreply@generative-cv.com

# ── Frontend URL ──────────────────────────────────────────
CLIENT_URL=http://localhost:3000
```

### Frontend `.env.example`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Generative-CV
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Config Validation (Backend — Pydantic Settings)

```python
# app/config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "development"
    PORT: int = 8000
    DATABASE_URL: str
    JWT_ACCESS_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_ACCESS_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 7
    ENCRYPTION_KEY: str
    CORS_ORIGINS: str
    CLIENT_URL: str
    SMTP_HOST: str | None = None
    SUPABASE_URL: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()   # Crashes on startup if required fields missing
```

---

## 9. Security Checklist

### Backend (FastAPI)

- All secrets in `.env` — zero hardcoded values
- Pydantic Settings validates env on startup — crashes if misconfigured
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are different, each ≥ 64 chars
- `ENCRYPTION_KEY` is 32 random bytes (AES-256) — env only, never logged
- bcrypt cost ≥ 10 for password hashing
- Refresh tokens stored as bcrypt hash in DB — never raw
- Refresh token rotation on every `/auth/refresh` call
- Account lockout after 5 failed logins → 15min TTL
- Ownership check on every resume endpoint (resume.user_id == request.user.id) → always 404 not 403
- AI API keys stored AES-256-GCM encrypted — decrypted only at call time, never logged
- Rate limiting: 10 req/min on auth routes, 100 req/min on API
- `Content-Type` validation on file upload endpoints
- File size limit enforced server-side (max 5MB per upload)
- CORS explicit origin list — never `*` with credentials
- `timingSafeEqual` equivalent for token comparison (Python: `hmac.compare_digest`)
- Generic error messages on auth — no email enumeration
- SQL injection safe via SQLAlchemy ORM parameterized queries

### Frontend (Next.js)

- Access token in memory only (`tokenStore.ts`) — no `localStorage`
- Refresh cookie is `HttpOnly; Secure; SameSite=Strict`
- Single-flight refresh queue — no duplicate `/auth/refresh` calls
- AI API keys never sent to frontend — only stored server-side
- No `dangerouslySetInnerHTML` without `DOMPurify`
- All forms validated with Zod before submission
- `NEXT_PUBLIC_*` vars only — never expose secrets to browser
- Error boundaries at root level
- All protected routes wrapped in `RequireAuth`
- No sensitive data in `console.log` in production

---

## 10. Frontend Architecture

### Theme Setup (Tailwind dark/light)

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#00FFF0',
        'brand-dark': '#00CCC0',
      }
    }
  }
}
```

### Token Store

```typescript
// src/lib/auth/tokenStore.ts
let _token: string | null = null;
export const tokenStore = {
  get: () => _token,
  set: (t: string) => { _token = t; },
  clear: () => { _token = null; },
};
```

### Axios Client

```typescript
// src/lib/api/client.ts
import axios from 'axios';
import { tokenStore } from '../auth/tokenStore';
import { refreshClient } from './refreshClient';

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + '/api/v1',
  withCredentials: true,
  timeout: 15_000,
});

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: Function; reject: Function }> = [];

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }
      isRefreshing = true;
      try {
        const { data } = await refreshClient.post('/auth/refresh');
        tokenStore.set(data.data.accessToken);
        refreshQueue.forEach((p) => p.resolve(data.data.accessToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return client(original);
      } catch {
        refreshQueue.forEach((p) => p.reject());
        refreshQueue = [];
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

### Auth Provider

```typescript
// src/lib/auth/AuthProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { client } from '../api/client';
import { tokenStore } from './tokenStore';
import { refreshClient } from '../api/refreshClient';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: refresh } = await refreshClient.post('/auth/refresh');
        tokenStore.set(refresh.data.accessToken);
        const { data: me } = await client.get('/users/me');
        setUser(me.data);
      } catch {
        // No valid session
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 11. AI Integration Layer

### Provider Routing Logic

```python
# app/modules/ai/service.py
from app.modules.ai.providers import anthropic, gemini, nvidia_nim
from app.utils.encryption import decrypt

PROVIDER_MAP = {
    "anthropic": anthropic.complete,
    "gemini": gemini.complete,
    "nvidia-nim": nvidia_nim.complete,
    "custom": anthropic.complete,  # OpenAI-compatible
}

async def ai_complete(user_id: str, prompt: str, db) -> str:
    provider = await get_default_provider(user_id, db)
    api_key = decrypt(provider.api_key_encrypted)
    base_url = provider.base_url  # for custom/nvidia
    fn = PROVIDER_MAP[provider.provider_name]
    return await fn(prompt=prompt, api_key=api_key, base_url=base_url)
```

### System Prompts

```python
# app/modules/ai/prompts.py

SUMMARY_PROMPT = """
You are a professional resume writer. Given the user's job title, skills, 
experience, and target job description, write a compelling 3-4 sentence 
professional summary. Be specific, use active voice, and include relevant keywords.
Return ONLY the summary text, no extra commentary.
"""

SKILLS_PROMPT = """
Given this job description and the user's current skills, suggest 
8-12 relevant technical and soft skills the user should highlight.
Return ONLY a JSON array of strings: ["skill1", "skill2", ...]
"""

EXPERIENCE_PROMPT = """
Improve these experience bullet points for the given job role.
Use strong action verbs, add quantifiable impact where logical, 
and align with the job description keywords.
Return ONLY a JSON array of improved bullet strings.
"""

ATS_SCORE_PROMPT = """
You are an ATS (Applicant Tracking System) expert. Analyze this resume against 
the job description. Return ONLY valid JSON with this exact structure:
{
  "overall_score": <0-100>,
  "section_scores": {
    "format": <0-100>,
    "keywords": <0-100>,
    "readability": <0-100>,
    "completeness": <0-100>
  },
  "missing_keywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}
"""
```

### API Key Verify Flow

```python
# app/modules/ai/service.py
async def verify_api_key(provider_name: str, api_key: str, base_url: str | None) -> bool:
    try:
        fn = PROVIDER_MAP[provider_name]
        result = await fn(
            prompt="Reply with just: OK",
            api_key=api_key,
            base_url=base_url,
            max_tokens=5
        )
        return bool(result)
    except Exception:
        return False
```

---

## 12. Component Architecture

### Resume Form Sections

Each section is a self-contained component:

```
ResumeForm
├── PersonalSection       — name, email, mobile, address, job-title
├── LinksSection          — github, linkedin, portfolio (URL inputs)
├── SummarySection        — textarea + AISuggestButton
├── SkillsSection         — tag-input + AISuggestButton
├── ExperienceSection     — dynamic list (add/remove)
│   └── ExperienceItem    — company, role, dates, bullet points
├── ProjectsSection       — dynamic list
│   └── ProjectItem       — name, desc, live-link, tech-stack + AISuggest
├── EducationSection      — institution, degree, year, grade
├── CertificationsSection — name, issuer, year, url
└── CustomSection         — label + textarea (add more)
```

### AISuggestButton Component

```typescript
interface AISuggestButtonProps {
  section: 'summary' | 'skills' | 'experience' | 'projects';
  context: Record<string, any>;   // Current form data context
  onSuggest: (suggestion: any) => void;
}
```

- Shows loading spinner during AI call
- Displays suggestion in modal/drawer
- User can accept (replace) or reject (dismiss)
- Disabled if no AI provider configured → redirect to `/settings/ai`

### Resume Templates

Each template receives same `ResumeData` prop:

```typescript
interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  skills: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  custom_sections: CustomSection[];
}
```

Templates are pure presentational — no logic, just layout.

---

## 13. Deployment Plan

### Frontend (Vercel)

```bash
# Build command
npm run build

# Env vars to set in Vercel dashboard:
NEXT_PUBLIC_API_BASE_URL=https://api.generative-cv.com
NEXT_PUBLIC_APP_URL=https://generative-cv.com
```

### Backend (Render / Railway)

```bash
# Start command
uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Env vars to set in platform dashboard:
# All vars from backend/.env.example
# DATABASE_URL → Supabase/Neon connection string with pooler
```

### Database (Supabase / Neon)

- Enable connection pooling (PgBouncer mode)
- Run Alembic migrations on deploy: `alembic upgrade head`
- Set up DB backups (daily at minimum)

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on: [pull_request]
jobs:
  backend:
    steps:
      - run: pip install -r requirements.txt
      - run: ruff check app/           # lint
      - run: mypy app/                 # typecheck
      - run: pytest                    # tests

  frontend:
    steps:
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
      - run: npm audit --audit-level=high
```

---

## Appendix: User Stories

| # | As a | I want to | So that |
|---|---|---|---|
| 1 | Job seeker | Create a resume with a template | I can apply quickly |
| 2 | Job seeker | Upload my existing resume | I don't start from scratch |
| 3 | Job seeker | Get AI to tailor my resume to a JD | I increase my match rate |
| 4 | Job seeker | Check ATS score before applying | I know if my resume will pass filters |
| 5 | Power user | Use my own Anthropic key | I control costs and model choice |
| 6 | User | Switch resume templates | I can try different styles |
| 7 | User | Export resume as PDF | I can submit it to employers |
| 8 | User | See live preview while editing | I can see changes instantly |

---

*Generative-CV PRD v1.0 — Build. Ship. Get Hired.*
