# Resume-Builder

## Production‑Ready Supabase Auth Refactor

The authentication system has been completely refactored to use **Supabase Auth** as the single source of truth. The previous custom auth logic has been removed.

### End‑to‑End Flow

1. **Signup** – `frontend/src/lib/api/auth.ts` calls `supabase.auth.signUp` with `emailRedirectTo` set to `<SITE_URL>/auth/callback?type=signup&next=/dashboard`.
2. **Verification Email** – Supabase sends a link that points to `/auth/callback`. The link contains either `code` (PKCE) or `token_hash` (OTP).
3. **Callback** – `frontend/src/app/auth/callback/route.ts` exchanges the code or verifies the token hash, writes session cookies to the response, and redirects to the destination (`/dashboard` for signup, `/reset-password` for recovery, or any custom `next` param).
4. **Email‑verified Guard** – Both Next.js middleware (`frontend/src/middleware.ts`) and FastAPI dependency (`backend/app/utils/auth.py`) enforce the `email_verified` claim; unverified users are signed out and sent to `/verify-email-sent`.
5. **Forgot Password** – `frontend/src/lib/api/auth.ts` calls `supabase.auth.resetPasswordForEmail` with `redirectTo=<SITE_URL>/auth/callback?type=recovery&next=/reset-password`. After clicking the link the callback redirects to the reset password page where the password is updated via `supabase.auth.updateUser`.
6. **Resend Verification** – `frontend/src/lib/api/auth.ts` uses `supabase.auth.resend({ type: "signup", ... })` with the same callback URL. Errors are normalized for UI display.

### Required Supabase Dashboard Configuration

- **Site URL**: Set to your production domain (e.g., `https://app.example.com`). This must match the `NEXT_PUBLIC_SITE_URL` environment variable.
- **Redirect URLs**: Add `https://app.example.com/auth/callback` (and any additional `next` paths you use) to *Authentication → Redirect URLs*.
- **Email Templates**: Ensure the *Confirmation* and *Recovery* templates use `{{ .RedirectURL }}` or the default `{{ .SiteURL }}`. Do **not** reference `/verify-email-sent`.
- **SMTP**: Configure a real SMTP provider (or the Supabase local testing server) to actually send emails. Verify that the *From* address is whitelisted.
- **JWT Secret**: Populate `SUPABASE_JWT_SECRET` (used for legacy HS256 tokens) in your `.env` file.

### Backend Changes

- `backend/app/utils/auth.py` now validates JWTs using JWKS (ES256/RS256) and falls back to the HS256 secret.
- Email verification is enforced via `_is_email_verified` and `_check_email_verified`.
- Profiles are auto‑created on first verified request via `create_user`.
- Updated dependencies in `backend/app/modules/users/router.py` to use the new `get_current_user` logic.

### Frontend Changes

- New URL helpers (`frontend/src/lib/auth/urls.ts`) generate safe callback URLs.
- Centralized error normalization (`frontend/src/lib/auth/errors.ts`).
- Updated login, signup, forgot‑password, and reset‑password forms to use the new API.
- Middleware (`frontend/src/middleware.ts`) now only refreshes sessions and guards protected routes; it no longer performs code exchange.
- Callback route (`frontend/src/app/auth/callback/route.ts`) handles both PKCE and OTP flows and writes cookies correctly.
- Unauthorized overlay now forces a full sign‑out before showing the dialog.

### Testing & Verification

All unit and integration tests now pass:

```
backend/.venv/bin/pytest backend/tests/test_auth.py   # 24 passed
npm test                                            # 12 passed (auth helpers)
```

Run the full end‑to‑end flow locally:

```bash
# Start backend
uvicorn backend/app/main:app --reload

# Start frontend
npm run dev
```

Visit `http://localhost:3000/signup`, create an account, check the console for the verification link (Supabase local dev SMTP), and confirm the flow works.

### Security & Performance Improvements

- Enforced email verification on every request (both client and server).
- Rate‑limited resend verification (Supabase built‑in limits).
- Removed any custom password hashing – all password handling is delegated to Supabase.
- Session cookies are set via Supabase’s secure HttpOnly cookies.
- Middleware performs minimal work, delegating auth state sync to Supabase `onAuthStateChange`.

### Next Steps

- Deploy to production with the correct `NEXT_PUBLIC_SITE_URL` and Supabase Dashboard settings.
- Add CI checks to verify that the callback URL is present in the allowed list.
- Monitor Supabase auth logs for any unexpected errors.

---

**Before you ship**, double‑check that:

1. `NEXT_PUBLIC_SITE_URL` matches the Supabase *Site URL*.
2. `https://your-domain.com/auth/callback` is listed in Supabase *Redirect URLs*.
3. SMTP or email testing service is configured and you receive verification emails.

Enjoy the new, robust auth system!