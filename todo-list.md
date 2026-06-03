# TODO List

## Completed
- [x] 8 free template components + template registry + helpers
- [x] Template gallery page (`/templates`)
- [x] Real-time template switcher in BuilderWizard
- [x] PDF export via @react-pdf/renderer
- [x] DOCX export via docx library
- [x] ATS scoring algorithm (TF-IDF, Levenshtein, skill matching) — `lib/ats.ts`
- [x] JD keyword extraction (`/api/jd/parse/`)
- [x] ATS score page UI (`/ats/score`)
- [x] ATS optimize page UI (`/ats/optimize`) + API fix
- [x] Cover letter generator (page + API)
- [x] Resume builder wizard (stepper, template switcher, live preview, export)
- [x] AI SDK v6 migration (`maxOutputTokens`, `streamText`, `toTextStreamResponse`)
- [x] Prisma schema indexes + cascading deletes
- [x] All resume/ATS routes consolidated to Prisma (Supabase residual removed)
- [x] Type declarations (`fast-levenshtein`, `pdf-parse`)
- [x] Rate limiting on AI endpoints (IP-based, 429 + Retry-After)
- [x] SEO meta tags, Open Graph, Twitter Card, sitemap.xml, robots.txt
- [x] `.env.example` with all variables documented
- [x] `next.config.mjs` production hardening (security headers, image patterns)
- [x] E2E test scaffolding (Playwright config + landing smoke test)
- [x] Dashboard sidebar with all nav links

## Pending — needs external credentials

- [ ] No external payment, monitoring, or analytics credentials required for local-only use

## Pending — no credentials needed

- [ ] Vercel production deployment + env var verification
- [ ] E2E tests expanded beyond landing page smoke test
