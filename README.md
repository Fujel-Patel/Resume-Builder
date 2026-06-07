# Resume-Builder

AI-powered resume builder built with **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma** + **Supabase Postgres**, **NextAuth**, and the **Vercel AI SDK** (multi-provider: Google, Groq, OpenAI/NVIDIA, Anthropic).

Build resumes through a guided wizard, preview against multiple templates, score against a job description (ATS), generate content with AI, and export to PDF/DOCX.

## Tech Stack

| Area        | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, RSC), React 19                        |
| Language    | TypeScript (strict)                                           |
| Styling     | Tailwind CSS v4 (`@tailwindcss/postcss`)                      |
| Data / ORM  | Prisma Client + Supabase Postgres                             |
| Auth        | NextAuth v5 (`@next-auth/prisma-adapter`)                     |
| AI          | Vercel AI SDK v6 (`@ai-sdk/google`, `groq`, `openai`, `anthropic`) |
| PDF / DOCX  | `@react-pdf/renderer`, `docx`                                 |
| Testing     | Vitest + Testing Library + jest-axe; Playwright (e2e)         |

## Prerequisites

- **Node.js 22.x** (project developed on v22.12.0)
- **npm 10+**
- A **Supabase Postgres** database (or any Postgres) for `DATABASE_URL`

## Getting Started

```bash
# 1. Install dependencies (also generates the Prisma client via postinstall/build)
npm install

# 2. Configure environment
cp .env.example .env.local
# then fill in DATABASE_URL, NEXTAUTH_SECRET, Supabase + AI provider keys

# 3. Generate the Prisma client and apply the schema
npx prisma generate
npx prisma migrate dev      # or: npx prisma db push

# 4. Start the dev server
npm run dev                 # http://localhost:3000
```

## Environment Variables

All variables are documented in [`.env.example`](./.env.example). Environment access is centralized and validated in [`src/lib/env.ts`](./src/lib/env.ts) (non-throwing at build time; use `assertServerEnv()` in server code to fail fast at runtime).

Key variables:

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `DATABASE_URL` | ✅ | Prisma/Postgres connection string |
| `DIRECT_URL` | – | Direct (non-pooled) Postgres URL for migrations |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | ✅ | NextAuth session config |
| `NEXT_PUBLIC_SUPABASE_URL` | – | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | – | Supabase client (anon/publishable) key |
| `SUPABASE_SERVICE_ROLE_KEY` | – | Supabase server-side key |
| `DEFAULT_AI_PROVIDER` | – | `google` \| `groq` \| `openai` \| `anthropic` \| `nvidia` |
| `GOOGLE_GENERATIVE_AI_API_KEY` / `GROQ_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `NVIDIA_NIM_API_KEY` | – | Provider API keys (set the one matching `DEFAULT_AI_PROVIDER`) |

> Note: the Supabase client key is read as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `src/utils/supabase/*`.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the dev server (hot reload) |
| `npm run build` | `prisma generate` + production `next build` |
| `npm start` | Start the production server (after build) |
| `npm run lint` | ESLint 9 flat config (`eslint.config.mjs`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the Vitest suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run analyze` | Build with the bundle analyzer (`ANALYZE=true`) |

## Project Structure

```
src/
  app/                 # App Router routes
    (dashboard)/       # Authenticated app (builder, dashboard, ats, templates, settings)
    (marketing)/       # Public marketing pages
    api/               # Route handlers: ai/*, ats/*, resumes/*, auth/*
  components/          # UI grouped by feature (resume, dashboard, templates, ui, shared)
  lib/                 # env, prisma, ai, sample-resume, validation/
  utils/supabase/      # Supabase client/server/middleware helpers
  types/               # Shared TypeScript types
prisma/                # schema.prisma + migrations
e2e/                   # Playwright tests
```

## Architecture Notes

- **Server vs Client Components**: Anything using hooks/browser APIs is marked `"use client"`. Server Components pass only serializable data across the boundary — e.g. `StatsBar` receives string icon keys, not component references.
- **Lazy template previews**: Dynamic template components are created once at module scope (`TEMPLATE_COMPONENTS` maps in `LazyResumePreview` / `LazyTemplatePreview`) rather than during render.
- **Validation**: Form schemas live in `src/lib/validation/schemas.ts` (Zod) and are shared by forms (via `react-hook-form`) and API routes.

## Testing

```bash
npm test                 # unit/component tests (Vitest + Testing Library + jest-axe)
npm run test:visual      # Playwright visual tests (chromium)
```

## Deployment

The app is optimized for **Vercel**. Set the environment variables above in the Vercel project settings; `npm run build` runs `prisma generate` automatically. Any Node 22 host running `npm run build && npm start` works as well.
