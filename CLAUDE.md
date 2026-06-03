# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

- **Framework**: Next.js 16 (app router) – TypeScript, React 19.
- **Styling**: Tailwind CSS (tailwind.config.ts scans `src/**/*.{js,ts,jsx,tsx}`).
- **Backend / Data**: Supabase for authentication and database, accessed via `@supabase/ssr` helpers (`server.ts`, `client.ts`, `middleware.ts`).
- **ORM / DB**: Prisma client (`src/lib/prisma.ts`) configured at runtime via `DATABASE_URL`.
- **AI Services**: Placeholder API routes under `src/app/api/ai/*` for cover‑letter generation, ATS optimization, etc.
- **Additional APIs**: ATS parsing/ scoring under `src/app/api/ats/*`, resume handling under `src/app/api/resumes/*`.
- **Project Type**: Full‑stack web app (SSR + API routes) with a focus on generating resumes/CV content via AI.

## Common Development Commands

| Task | Command |
|------|---------|
| **Start dev server** (hot‑reload) | `npm run dev` |
| **Run tests** (currently placeholder) | `npm test` |
| **Build for production** | `npm run build` *(not defined – add if needed)* |
| **Start production server** | `npm start` *(not defined – add if needed)* |
| **Run a single test file** | `npx jest path/to/test.spec.ts` *(install jest if required)* |
| **Run Prisma migrations** | `npx prisma migrate dev` |
| **Generate Prisma client** | `npx prisma generate` |
| **Open a REPL with Supabase client** | `node -e "require('./src/utils/supabase/client')"` |

> **Note**: The repository currently defines only the `dev` script. Consider adding `build`, `start`, `lint`, and proper test scripts for a smoother workflow.

## High‑Level Architecture

- **`src/app/`** – Next.js app router entry points.
  - `page.tsx` – Root page that demonstrates a simple Supabase query.
  - Sub‑folders `(auth)`, `(marketing)`, `(dashboard)` use **component segments** (parentheses) to group related routes.
  - `src/app/api/` – Server‑less API routes (Edge functions) exposing JSON endpoints. Major groups:
    - `ai/*` – AI‑related endpoints (`cover-letter`, `generate`, `improve`, `ats-optimize`). Currently empty placeholders.
    - `ats/*` – ATS parsing and scoring endpoints.
    - `resumes/*` – Resume CRUD endpoints (`export`, `[id]`, `upload`).
    - `user/*` – User‑related endpoints (not shown but mirrored pattern).
    - `webhooks/*` – Webhook receivers.
- **`src/components/`** – UI components, grouped by feature (e.g., `cover-letter`, `dashboard`, `resume`, `templates`, `shared`, `ui`). Most are stubs but represent the intended component hierarchy.
- **`src/lib/`** – Utility libraries:
  - `prisma.ts` – Global Prisma client with runtime datasource URL (Supabase/Postgres).
  - `prompts/` – (currently empty) intended for prompt templates used by AI routes.
- **`src/utils/supabase/`** – Helper to create Supabase clients for server, client, and middleware contexts.
- **`src/types/`** – Type definitions for shared data models (not listed here but present).
- **Configuration files** – `next.config.ts` (environment variable exposure), `tailwind.config.ts`, `tsconfig.json`, `package.json` (dependencies), `.env*` files (not committed) for Supabase keys and database URLs.

## Important Configuration & Secrets

- **Environment Variables** (must be defined in `.env` or deployment platform):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` – used in utils)
  - `DATABASE_URL` – connection string for Prisma (Supabase Postgres).
- **Supabase Integration** – Uses `@supabase/ssr` to create server‑side and client‑side clients with cookie handling for auth sessions.
- **Prisma** – Generated from `prisma/schema.prisma` (not shown) and expects the `DATABASE_URL` at runtime.

## Development Tips for Claude Code

- When editing or adding new API routes, follow the **app router** convention: create a `route.ts` (or `route.tsx`) file exporting the appropriate HTTP handler (`GET`, `POST`, etc.).
- Use the Supabase helpers (`createClient` from `src/utils/supabase/*`) to access the database consistently across server components, client components, and middleware.
- Keep Tailwind class usage within the `src/**/*.tsx` files; the Tailwind config already scans these locations.
- For any new Prisma models, run `npx prisma migrate dev` and `npx prisma generate` to keep the client up‑to‑date.
- Add linting (e.g., ESLint with `next/core-web-vitals`) and formatting (Prettier) scripts to enforce code quality – not required for Claude but improves future maintenance.

## References to Existing Documentation

- **README.md** – No dedicated README present; the root `package.json` provides basic scripts.
- **.cursor/rules/** – No cursor rules detected.
- **.github/copilot-instructions.md** – Not present.

Feel free to extend this CLAUDE.md as the codebase grows (e.g., when real implementations are added under `src/app/api/ai/*`).
