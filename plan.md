# AI Resume & CV Platform — Full Project Plan

> **Version:** 1.0  
> **Stack:** Next.js 14 · TypeScript · Supabase · Prisma · Claude API · Vercel  
> **Standard:** Industry-grade, production-ready architecture

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Pages & Routes](#5-pages--routes)
6. [Folder / Codebase Structure](#6-folder--codebase-structure)
7. [Database Schema](#7-database-schema)
8. [API Endpoints](#8-api-endpoints)
9. [Authentication](#9-authentication)
10. [AI Layer](#10-ai-layer)
11. [ATS Scoring Logic](#11-ats-scoring-logic)
12. [Templates System](#12-templates-system)
13. [Build Phases & Roadmap](#13-build-phases--roadmap)
14. [Environment Variables](#14-environment-variables)
15. [Industry Standards & Best Practices](#15-industry-standards--best-practices)

---

## 1. Project Overview

A full-stack, AI-powered resume and cover letter platform that allows users to:

- Build resumes from scratch via a guided form
- Upload an existing resume and let AI restructure and improve it
- Optimize a resume against a specific job description for ATS (Applicant Tracking System) compatibility
- Get an ATS score for any uploaded resume
- Switch between multiple professional templates instantly
- Export resumes as PDF or DOCX
- Generate tailored cover letters

---

## 2. Features

| Feature | Description |
|---|---|
| Resume Builder (Form) | Step‑by‑step form collects user info → AI generates a polished resume |
| Resume Builder (Upload) | User uploads existing resume (PDF/DOCX) → AI parses and rebuilds it |
| ATS Optimizer | Upload resume + JD → AI rewrites resume to match JD keywords |
| ATS Score Checker | Upload resume → receive keyword score, section score, and improvement tips |
| Cover Letter Generator | Based on resume + JD → AI writes a tailored cover letter |
| Template Switcher | 8+ free professional templates, switchable in real‑time |
| PDF / DOCX Export | Pixel‑perfect export via @react-pdf/renderer (PDF) and docx library (DOCX) |
| Dashboard | User manages all resumes, cover letters, and ATS reports |
| Auth | Google OAuth + email magic link + email/password |
| Free & Paid Tiers | Free: limited AI calls. Paid: unlimited via Stripe |

---

## 3. Tech Stack

### Frontend

| Tool | Purpose |
|---|---|
| Next.js 14 (App Router) | SSR, RSC, routing, API handlers |
| TypeScript | Type safety across the full stack |
| Tailwind CSS | Utility‑first styling |
| shadcn/ui | Accessible, unstyled component primitives |
| Framer Motion | Animations and transitions |
| React Hook Form + Zod | Form handling and validation |
| Vercel AI SDK | Streaming AI responses to the UI |

### Backend

| Tool | Purpose |
|---|---|
| Next.js Route Handlers | REST API endpoints (Edge‑compatible) |
| Prisma ORM | Type‑safe database access and migrations |
| Zod | Runtime schema validation on all API inputs |
| pdf-parse | Extract text from uploaded PDF resumes |
| mammoth | Extract text from uploaded DOCX resumes |
| @react-pdf/renderer | Headless Chrome for PDF export |
| docx (npm) | Generate DOCX export files |

### AI

| Tool | Purpose |
|---|---|
| Vercel AI SDK | Streaming, tool calls, structured output helpers with support for multiple LLMs |
| Anthropic Claude API (via AI SDK) | Resume generation, ATS optimization, cover letter |
| Google Gemini (via AI SDK) | Alternative LLM for AI features |
| Groq (via AI SDK) | Fast LLM inference for AI features |
| NVIDIA Nim (via OpenAI-compatible API) | High-performance LLM serving |
| LangChain (optional) | RAG pipeline for job description analysis |

### Storage & Database

| Tool | Purpose |
|---|---|
| PostgreSQL (via Supabase) | Primary relational database |
| Supabase Storage | File storage for uploaded PDFs/DOCXs |
| Upstash Redis | Rate limiting, session caching |
| Prisma | ORM with type‑safe schema |

### Auth

| Tool | Purpose |
|---|---|
| NextAuth.js v5 | Auth framework |
| Google OAuth | Social login |
| GitHub OAuth | Social login |
| Email Magic Link | Passwordless login |
| JWT + RLS | Session management + row‑level security |

### Infrastructure

| Tool | Purpose |
|---|---|
| Vercel | Deployment, edge functions, CI/CD |
| Localhost | Personal local development |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER / BROWSER                               │
│              Next.js 14 App Router — SSR + RSC                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                 │
│           Next.js Route Handlers  /api/*                        │
│           Edge Runtime — low-latency streaming                  │
└──────┬────────────┬──────────────┬──────────────┬──────────────┘
       │            │              │              │
       ▼            ▼              ▼              ▼
┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────┐
│  Auth    │ │  Resume   │ │    AI    │ │  ATS         │
│ Service  │ │  Service  │ │ Service  │ │  Service     │
│NextAuth  │ │CRUD+parse │ │Claude/  │ │score+parse   │
│          │ │           │ │GPT-4o   │ └──────────────┘
└──────────┘ └───────────┘ └──────────┘
       │            │              │              │
       └────────────┴──────────────┴──────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STORAGE                                  │
│  PostgreSQL (Supabase) │ Supabase Storage │ Upstash Redis       │
│  Users, resumes, jobs  │ PDF/DOCX uploads │ Rate limit, cache   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AI LAYER — LLM Orchestration                   │
│    Claude API (Anthropic) — resume gen, cover letter, ATS edit  │
│    Vercel AI SDK — streaming responses to UI in real-time       │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│   Resend (email) │ Stripe (payments) │ Sentry │ Vercel (deploy) │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

- **SSR for SEO‑critical pages** — landing, templates, blog pages use Server‑Side Rendering
- **React Server Components** for data‑fetching pages — no client waterfalls
- **Edge Runtime for API routes** — AI streaming endpoints run at the edge for minimal latency
- **Vercel AI SDK** — handles streaming text and tool calls from Claude to the browser
- **Prisma ORM** — single schema is the source of truth for TypeScript types and DB structure
- **Supabase Row Level Security** — users can only read/write their own data
- **Rate limiting via Upstash** — sliding window, Redis‑backed, applied at middleware level

---

## 5. Pages & Routes

### Public Pages

| Route | Description |
|---|---|
| `/` | Landing page — hero, features, pricing, CTA |
| `/templates` | Browse all free resume templates with previews |
| `/pricing` | Free vs Pro comparison |
| `/login` | Login with Google, GitHub, or email magic link |
| `/register` | Sign up page |
| `/blog` | (Optional) SEO content about resume tips |

### Protected Pages (require auth)

| Route | Description |
|---|---|
| `/dashboard` | User's resumes, cover letters, ATS reports |
| `/builder` | Resume builder — form‑based or AI‑powered creation |
| `/builder/[id]` | Edit existing resume in builder |
| `/ats-optimize` | Upload resume + JD → AI‑optimized resume |
| `/ats-score` | Upload resume → ATS score report |
| `/cover-letter` | Generate or edit a cover letter |
| `/cover-letter/[id]` | Edit specific cover letter |
| `/templates/[id]` | Preview and apply a specific template |
| `/settings` | User profile and notifications |

---

## 6. Folder / Codebase Structure

```
resume-ai/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group — no layout chrome
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Route group — dashboard layout
│   │   │   ├── layout.tsx            # Sidebar + nav
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── builder/
│   │   │   │   ├── page.tsx          # New resume builder
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Edit existing resume
│   │   │   ├── ats-optimize/
│   │   │   │   └── page.tsx
│   │   │   ├── ats-score/
│   │   │   │   └── page.tsx
│   │   │   ├── cover-letter/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── (marketing)/              # Route group — public/marketing layout
│   │   │   ├── layout.tsx            # Header + footer
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   └── templates/
│   │   │       ├── page.tsx          # Template gallery
│   │   │       └── [id]/
│   │   │           └── page.tsx      # Template preview
│   │   └── api/                      # Route handlers
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── resumes/
│   │       │   ├── route.ts          # GET list, POST create
│   │       │   ├── [id]/
│   │       │   │   └── route.ts      # GET, PUT, DELETE
│   │       │   ├── upload/
│   │       │   │   └── route.ts      # POST: parse PDF/DOCX
│   │       │   └── export/
│   │       │       └── route.ts      # POST: export to PDF/DOCX
│   │       ├── ai/
│   │       │   ├── generate/
│   │       │   │   └── route.ts      # POST: form → resume (streaming)
│   │       │   ├── improve/
│   │       │   │   └── route.ts      # POST: existing → improved (streaming)
│   │       │   ├── cover-letter/
│   │       │   │   └── route.ts      # POST: generate cover letter (streaming)
│   │       │   └── ats-optimize/
│   │       │       └── route.ts      # POST: resume + JD → optimized (streaming)
│   │       ├── ats/
│   │       │   ├── score/
│   │       │   │   └── route.ts      # POST: score a resume
│   │       │   └── parse-jd/
│   │       │       └── route.ts      # POST: extract keywords from JD
│   │       ├── templates/
│   │       │   ├── route.ts          # GET: list templates
│   │       │   └── [id]/
│   │       │       └── route.ts      # GET: single template
│   │       ├── cover-letters/
│   │       │   ├── route.ts          # GET list, POST create
│   │       │   └── [id]/
│   │       │       └── route.ts      # GET, PUT, DELETE
│   │       └── user/
│   │           ├── profile/
│   │           │   └── route.ts      # GET, PUT user profile
│   │   └── webhooks/
│   │       └── internal/
│   │           └── route.ts      # Internal webhook handler
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components (copy‑owned)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── resume/
│   │   │   ├── ResumeBuilder.tsx     # Main builder form with sections
│   │   │   ├── ResumePreview.tsx     # Live preview pane
│   │   │   ├── ResumeSection.tsx     # Individual section (experience, skills, etc.)
│   │   │   ├── ATSScoreCard.tsx      # Score display with breakdown
│   │   │   └── ExportMenu.tsx        # PDF / DOCX export options
│   │   ├── templates/
│   │   │   ├── TemplateCard.tsx      # Gallery card with hover preview
│   │   │   ├── TemplateGallery.tsx   # Grid of all templates
│   │   │   └── templates/            # Individual template components
│   │   │       ├── ClassicTemplate.tsx
│   │   │       ├── ModernTemplate.tsx
│   │   │       ├── MinimalTemplate.tsx
│   │   │       ├── CreativeTemplate.tsx
│   │   │       └── ...
│   │   ├── cover-letter/
│   │   │   ├── CoverLetterEditor.tsx
│   │   │   └── CoverLetterPreview.tsx
│   │   ├── dashboard/
│   │   │   ├── ResumeCard.tsx
│   │   │   └── StatsBar.tsx
│   │   └── shared/
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       ├── FileUploader.tsx      # Drag-and-drop PDF/DOCX upload
│   │       ├── StreamingText.tsx     # Renders AI stream token‑by‑token
│   │       └── LocalOnlyNotice.tsx   # Indicates local personal-use mode
│   │
│   ├── lib/
│   │   ├── ai.ts                     # Claude API client + prompt builders
│   │   ├── prompts/
│   │   │   ├── resume-generate.ts    # System + user prompt for generation
│   │   │   ├── resume-improve.ts     # Prompt for improving existing resume
│   │   │   ├── ats-optimize.ts       # Prompt for ATS optimization
│   │   │   └── cover-letter.ts       # Prompt for cover letter
│   │   ├── ats.ts                    # ATS scoring algorithm
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── auth.ts                   # NextAuth.js config
│   │   ├── redis.ts                  # Upstash Redis client
│   │   ├── rate-limit.ts             # Rate limiter factory
│   │   ├── pdf-parser.ts             # pdf-parse wrapper
│   │   ├── docx-parser.ts            # mammoth wrapper
│   │   ├── pdf-export.ts             # @react-pdf/renderer PDF generation
│   │   └── docx-export.ts            # docx npm package export
│   │
│   ├── hooks/
│   │   ├── useResume.ts              # Resume CRUD state
│   │   ├── useAI.ts                  # AI streaming hook
│   │   ├── useATSScore.ts            # ATS score fetching
│   │   └── useUser.ts                # Current user profile state
│   │
│   ├── types/
│   │   ├── resume.ts                 # ResumeData, Section, Experience, etc.
│   │   ├── ats.ts                    # ATSReport, KeywordMatch, etc.
│   │   ├── template.ts               # Template metadata types
│   │   └── api.ts                    # API request/response types
│   │
│   └── middleware.ts                 # Auth guard on protected routes
│
├── prisma/
│   └── schema.prisma                 # Database schema (source of truth)
│
├── public/
│   ├── templates/                    # Template preview images
│   │   ├── classic.png
│   │   ├── modern.png
│   │   └── ...
│   └── og/                           # Open Graph images
│
├── .env.local                        # Local secrets (never committed)
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  resumes       Resume[]
  coverLetters  CoverLetter[]
  atsReports    ATSReport[]
}
// Rate limiting handled by Upstash Redis only. No DB tracking needed.

model Resume {
  id          String   @id @default(cuid())
  userId      String
  title       String
  templateId  String
  data        Json     // ResumeData JSON blob
  fileUrl     String?  // uploaded source file URL
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  atsReports  ATSReport[]

  @@index([userId])
}

model CoverLetter {
  id          String   @id @default(cuid())
  userId      String
  resumeId    String?
  title       String
  content     String   @db.Text
  jobTitle    String?
  company     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model ATSReport {
  id              String   @id @default(cuid())
  userId          String
  resumeId        String?
  jobDescription  String   @db.Text
  score           Int      // 0-100
  keywordMatches  Json     // { matched: [], missing: [] }
  sectionScores   Json     // { experience: 80, skills: 60, ... }
  suggestions     Json     // [ "Add X to skills section", ... ]
  createdAt       DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  resume  Resume? @relation(fields: [resumeId], references: [id])

  @@index([userId])
}

// Templates are static React components. Use lib/templates.ts for metadata config. No DB model needed.
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 8. API Endpoints

### Authentication
```
POST   /api/auth/[...nextauth]     NextAuth handler (signin, signout, callback)
```
### Resumes
```
GET    /api/resumes                List all resumes for authenticated user
POST   /api/resumes                Create a new resume (blank or from data)
GET    /api/resumes/[id]           Get a single resume by ID
PUT    /api/resumes/[id]           Update resume data or template
DELETE /api/resumes/[id]           Delete a resume

POST   /api/resumes/upload         Upload PDF or DOCX → returns extracted text + parsed JSON
POST   /api/resumes/export         Export resume to PDF or DOCX (body: { id, format })
```
### AI — All streaming via Vercel AI SDK (ReadableStream)
```
POST   /api/ai/generate            Form data → full AI‑generated resume JSON
POST   /api/ai/improve             Existing resume text → improved resume JSON
POST   /api/ai/ats-optimize        Resume text + JD → ATS‑optimized resume JSON
POST   /api/ai/cover-letter        Resume + JD → cover letter markdown (streaming text)
```
### ATS
```
POST   /api/ats/score              Upload resume text → ATSReport (score, keywords, suggestions)
POST   /api/ats/parse-jd           Job description text → extracted keywords and required skills
```
### Templates
```
GET    /api/templates              List all templates (id, name, previewUrl, isPremium)
GET    /api/templates/[id]         Get single template metadata
```
### Cover Letters
```
GET    /api/cover-letters          List all cover letters for user
POST   /api/cover-letters          Create new cover letter
GET    /api/cover-letters/[id]     Get single cover letter
PUT    /api/cover-letters/[id]     Update content
DELETE /api/cover-letters/[id]     Delete
```
### User
```
GET    /api/user/profile           Get current user profile
PUT    /api/user/profile           Update name, preferences
```
### Webhooks
```
POST   /api/webhooks/internal      Internal webhook handler
```
---

## 9. Authentication

**Library:** NextAuth.js v5

**Providers:**
- Google OAuth (`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`)
- GitHub OAuth (`GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`)

**Session strategy:** JWT (edge‑compatible)

**Middleware** (`src/middleware.ts`):
```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard") ||
                      req.nextUrl.pathname.startsWith("/builder") ||
                      req.nextUrl.pathname.startsWith("/ats-optimize") ||
                      req.nextUrl.pathname.startsWith("/ats-score") ||
                      req.nextUrl.pathname.startsWith("/cover-letter") ||
                      req.nextUrl.pathname.startsWith("/settings") ||
                      req.nextUrl.pathname.startsWith("/api/resumes") ||
                      req.nextUrl.pathname.startsWith("/api/ai") ||
                      req.nextUrl.pathname.startsWith("/api/ats");

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

**Supabase Row Level Security:** All DB tables have RLS policies ensuring `user_id = auth.uid()`. Even if the API is bypassed, data is protected at the database layer.
> **Warning:** Prisma uses service role and bypasses RLS. Security must be enforced in API middleware (auth check + user ID validation), not relied on from RLS alone.

---

## 10. AI Layer

### Claude API Setup (`src/lib/ai.ts`)
```typescript
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

### Streaming Route Example (`/api/ai/generate/route.ts`)
```typescript
import { anthropic } from "@/lib/ai";
import { generateResumePrompt } from "@/lib/prompts/resume-generate";
import { generateResumeSchema } from "@/types/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export const runtime = "edge";
// AI streaming routes = edge. DB routes = nodejs runtime.

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const limited = await checkRateLimit(session.user.id);
  if (limited) return new Response("Rate limit exceeded", { status: 429 });

  const body = await req.json();
  const parsed = generateResumeSchema.safeParse(body);
  if (!parsed.success) return new Response("Invalid input", { status: 400 });

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: generateResumePrompt.system,
    messages: [{ role: "user", content: generateResumePrompt.user(parsed.data) }],
  });

  return new Response(stream.toReadableStream());
}
```

### Prompt Files (`src/lib/prompts/`)
All prompts are typed constants — never inline strings. Each file exports:
```typescript
// src/lib/prompts/resume-generate.ts
export const generateResumePrompt = {
  system: `You are an expert resume writer. Return ONLY valid JSON matching the ResumeData schema.
Never include markdown, preamble, or explanation. Output raw JSON only.`,
  user: (data: GenerateResumeInput) => `
    Create a professional resume for:
    Name: ${data.name}
    Target Role: ${data.targetRole}
    Experience: ${JSON.stringify(data.experience)}
    Skills: ${data.skills.join(", ")}
    Education: ${JSON.stringify(data.education)}
    
    Return JSON matching this schema: { sections: { contact, summary, experience, education, skills } }
  `,
};
```
---

## 11. ATS Scoring Logic

**File:** `src/lib/ats.ts`

### Algorithm
1. **Parse job description** — extract nouns, technical skills, tools, using Claude or keyword extraction
2. **Parse resume sections** — extract text from each section with section labels
3. **Keyword match scoring:**
   - Skills section match = 3 points per keyword
   - Experience/summary match = 2 points per keyword
   - Anywhere in document = 1 point
4. **Section presence scoring** — check for: contact, summary/objective, experience, education, skills (+/- certifications, projects)
5. **Format scoring** — check for readable fonts, no tables in header, no images, standard section headings
6. **Final score** = keyword score (60%) + section score (25%) + format score (15%)

```typescript
export function scoreResume(resumeText: string, jdText: string): ATSReport {
  const jdKeywords = extractKeywords(jdText);
  const resumeKeywords = extractKeywords(resumeText);
  const matchedKeywords = jdKeywords.filter(k => resumeKeywords.includes(k));
  const missingKeywords = jdKeywords.filter(k => !resumeKeywords.includes(k));
  
  const keywordScore = Math.round((matchedKeywords.length / jdKeywords.length) * 100);
  const sectionScore = scoreSections(resumeText);
  const formatScore = computeFormatScore(resumeText); // placeholder implementation
  const finalScore = Math.round(keywordScore * 0.6 + sectionScore * 0.25 + formatScore * 0.15);
  
  return {
    score: finalScore,
    keywordMatches: { matched: matchedKeywords, missing: missingKeywords },
    sectionScores: sectionScore,
    suggestions: generateSuggestions(missingKeywords, sectionScore),
  };
}
```
---

## 12. Templates System

### Design
Each template is a **React component** that accepts a single `ResumeData` prop. Switching templates = swapping the component. Data never changes.
```typescript
// types/resume.ts
export interface ResumeData {
  contact: { name: string; email: string; phone?: string; location?: string; linkedin?: string; };
  summary?: string;
  experience: { company: string; role: string; duration: string; bullets: string[]; }[];
  education: { institution: string; degree: string; year: string; }[];
  skills: string[];
  certifications?: string[];
  projects?: { name: string; description: string; url?: string; }[];
}

// Usage in builder
const templates = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
};

const ActiveTemplate = templates[selectedTemplateId];
return <ActiveTemplate data={resumeData} />;
```

### Free Templates (8+)
| ID | Style | Description |
|---|---|---|
| `classic` | Traditional | Two‑column, navy header, serif body |
| `modern` | Contemporary | Clean sans‑serif, color accent bar |
| `minimal` | Ultra‑minimal | Single column, generous whitespace |
| `creative` | Bold | Full‑bleed sidebar, icon labels |
| `executive` | Formal | Centered header, conservative |
| `tech` | Developer‑focused | GitHub‑style, monospace accents |
| `academic` | Research | CV format with publications section |
| `compact` | Dense | Two‑page in one, small margins |

---

## 13. Build Phases & Roadmap

### Phase 1 — Foundation (Week 1–2)
- [x] Next.js 14 project setup with TypeScript + Tailwind
- [x] Prisma schema + Supabase DB setup
- [x] NextAuth.js — Google OAuth + email magic link
- [x] Dashboard shell UI with sidebar
- [x] Resume CRUD API endpoints
- [x] File upload to Supabase Storage
- [x] Resume list page on dashboard
- [x] Add tests for dashboard components (StatsBar)
- [x] Middleware auth guard

### Phase 2 — AI Core (Week 3–5)
- [ ] Claude API integration + Vercel AI SDK
- [ ] Streaming route for resume generation
- [ ] Form‑based resume builder (multi‑step form)
- [ ] Form → AI → resume generation flow
- [ ] Upload PDF/DOCX → parse text → AI rebuild flow
- [ ] Cover letter generator
- [ ] Live preview pane in builder
- [ ] AI streaming text component

### Phase 3 — ATS + Templates (Week 6–7)
- [ ] ATS scoring algorithm (`lib/ats.ts`)
- [ ] ATS score page + report UI
- [ ] JD keyword extraction
- [ ] ATS optimize flow (resume + JD → rewritten resume)
- [ ] 8 free template components
- [ ] Template gallery page
- [ ] Real‑time template switcher in builder
- [ ] PDF export via @react-pdf/renderer
- [ ] DOCX export via docx npm

### Phase 4 — Launch (Week 8)
- [ ] Rate limiting on AI endpoints (Upstash Redis)
- [ ] SEO meta tags, Open Graph images, sitemap
- [ ] Vercel production deployment
- [ ] E2E testing (Playwright) for critical paths

---

## 14. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # Supabase direct connection for migrations

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# AI
ANTHROPIC_API_KEY=""

# Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# Rate Limiting
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Monitoring
```

---

## 15. Industry Standards & Best Practices

### Code Quality
- **TypeScript strict mode** — `"strict": true` in tsconfig. No `any` types.
- **Zod validation on all API inputs** — reject malformed data before it reaches the DB
- **Prisma for all DB queries** — never raw SQL. Type‑safe at compile time.
- **All AI prompts in `lib/prompts/`** — never inline strings in route handlers
- **Error handling** — all API routes wrapped in try/catch with typed error responses
- **Environment variables** — secrets only in `.env.local`, never committed. Checked at startup.

### Security
- **Middleware auth guard** — all `/dashboard/*` and `/api/*` routes protected server‑side
- **Supabase RLS** — database‑level row security, user can only access own data
- **Input sanitization** — Zod strips unknown fields, validates types and lengths
- **Rate limiting** — Upstash Redis sliding window on all AI endpoints
- **CORS** — configured in `next.config.ts` to only allow your domain
- **File uploads** — validate MIME type and size server‑side before storing

### Performance
- **RSC (React Server Components)** for all data‑fetching pages — no client waterfalls
- **Edge Runtime** for AI streaming routes — minimal cold start latency
- **Image optimization** — `next/image` for all template previews
- **Incremental Static Regeneration** for public template gallery page
- **Redis caching** for ATS keyword extraction results

### Developer Experience
- **Absolute imports** — `@/components/...` via tsconfig `paths`
- **ESLint + Prettier** configured for consistent formatting
- **Husky + lint‑staged** — run linting on commit
- **Conventional commits** — `feat:`, `fix:`, `chore:` prefix on all commits
- **Prisma migrations** — all schema changes tracked and versioned

### Testing
- **Unit tests** — Vitest for utility functions (`lib/ats.ts`, `lib/prompts/`)
- **Component tests** — React Testing Library for UI components
- **E2E tests** — Playwright for critical user flows (register → build → export)
- **CI** — GitHub Actions runs tests and type‑check on every PR

---

*Last updated: 2026 — v1.0 — AI Resume Platform Blueprint*
