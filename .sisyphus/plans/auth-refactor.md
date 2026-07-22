# Auth System Audit & Refactor Plan

## Root Cause Analysis

### Problem 1: Verification redirects to `/verify-email-sent`

**Root cause:** Two issues combined:

1. **Missing `/auth/callback` route.** Supabase's PKCE flow requires a dedicated callback endpoint. The current code tries to do the exchange inline in middleware on `/verify-email`, but there's no guarantee the `code_verifier` cookie is available when the browser follows the email link. A dedicated `/auth/callback` route with proper cookie handling is the Supabase-recommended pattern.

2. **Supabase Dashboard misconfiguration.** The Supabase project's Redirect URLs whitelist likely does not include `http://localhost:3000/auth/callback` (or the production equivalent). When the email template sends a link to an unwhitelisted URL, Supabase may redirect to Site URL instead of the intended callback, causing the PKCE exchange to fail and the fallback redirect to `/verify-email-sent`.

### Problem 2: `email_confirmed_at` never updates

**Root cause:** The PKCE `exchangeCodeForSession()` call in middleware either:
- Never executes (email link goes to wrong URL)
- Fails silently (missing `code_verifier` cookie, expired code, wrong redirect URL)
- The redirect to `/dashboard` after successful exchange doesn't preserve session cookies properly

When exchange fails, the user gets redirected to `/verify-email-sent` (informational page) — never actually completing verification.

### Problem 3: Resend verification email fails silently

**Root cause:** `resendVerification()` in `auth.ts:74-84` calls `supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo } })`. This works IF:
- The email is registered in Supabase
- SMTP is configured
- The `emailRedirectTo` URL is whitelisted in Supabase Redirect URLs

If the `emailRedirectTo` points to an unwhitelisted URL, Supabase may reject or silently drop the resend.

### Problem 4: Inconsistent auth flow

**Root cause:** No unified callback route. Verification uses middleware inline exchange. Password reset uses hash-based token parsing on client. Both approaches are fragile.

---

## Refactor: Files to Change

### NEW FILES

| File | Purpose |
|------|---------|
| `frontend/src/app/auth/callback/route.ts` | **NEW** — Supabase PKCE callback Route Handler. Handles email verification + password recovery. Replaces fragile middleware exchange. |

### MODIFIED FILES

| File | Change |
|------|--------|
| `frontend/src/middleware.ts` | Add `/auth/callback` to matcher. Add fallback code exchange for legacy `/verify-email` links. |
| `frontend/src/lib/api/auth.ts` | Update all `emailRedirectTo` URLs to `/auth/callback`. |
| `frontend/src/app/verify-email/page.tsx` | Rewrite: session-only check, no client-side token parsing. Clean success/error states. |
| `frontend/src/app/reset-password/page.tsx` | Rewrite: session check via `type=recovery` callback, remove hash-based token parsing. |
| `frontend/src/app/verify-email-sent/page.tsx` | Minor: ensure it's purely informational (already is). |
| `frontend/src/features/auth/login-form.tsx` | Update "Resend verification" link target. |
| `frontend/src/features/auth/forgot-password-form.tsx` | Ensure redirect URL is `/auth/callback?type=recovery`. |

### NO CHANGE NEEDED

| File | Reason |
|------|--------|
| `backend/app/utils/auth.py` | JWT validation via JWKS is correct. |
| `backend/app/modules/users/` | Profile CRUD is correct. |
| `backend/app/main.py` | No auth router needed — Supabase handles auth. |
| `frontend/src/lib/supabase/client.ts` | Correct. |
| `frontend/src/lib/supabase/server.ts` | Correct. |
| `frontend/src/lib/features/auth/authSlice.ts` | Auth state management is correct. |
| `frontend/src/components/auth/auth-guard.tsx` | Client-side guard is correct. |

---

## Implementation Steps

### Step 1: Create `/auth/callback` Route Handler

Create `frontend/src/app/auth/callback/route.ts`:
- GET handler receives `code` and `type` query params from Supabase email links
- Exchange PKCE code for session via `exchangeCodeForSession()`
- Redirect based on `type`: `signup` → `/verify-email`, `recovery` → `/reset-password`
- Handle errors gracefully (redirect to `/login?error=auth_callback_error`)

### Step 2: Update Middleware

Update `frontend/src/middleware.ts`:
- Add `/auth/callback` to matcher
- Add code exchange handler for `/auth/callback` path (primary path)
- Keep fallback exchange for legacy `/verify-email` links
- Keep fallback exchange for legacy `/reset-password` links

### Step 3: Update Auth API URLs

Update `frontend/src/lib/api/auth.ts`:
- `signup()`: Change `emailRedirectTo` from `/verify-email` to `/auth/callback?type=signup`
- `forgotPassword()`: Change `redirectTo` from `/reset-password` to `/auth/callback?type=recovery`
- `resendVerification()`: Change `emailRedirectTo` from `/verify-email` to `/auth/callback?type=signup`

### Step 4: Rewrite Verify Email Page

Rewrite `frontend/src/app/verify-email/page.tsx`:
- Check session on mount (no token parsing needed — callback already established session)
- Show success → "Go to Dashboard" button
- Show already-verified → "Go to Login" button
- Show error → "Resend verification" + "Back to Login"
- Remove hash-based token parsing (callback handles this)

### Step 5: Rewrite Reset Password Page

Rewrite `frontend/src/app/reset-password/page.tsx`:
- Check session on mount (callback already established recovery session)
- Show form if session valid
- Show error/expired if no session
- Remove hash-based token parsing (callback handles this)

### Step 6: Update Login Form

Update `frontend/src/features/auth/login-form.tsx`:
- Update "Resend verification email" link to point to `/verify-email-sent` (already correct)
- Verify the resend flow works end-to-end

### Step 7: Update Forgot Password Form

Update `frontend/src/features/auth/forgot-password-form.tsx`:
- No change needed (already calls `forgotPassword()` from auth.ts which we update in Step 3)

### Step 8: Supabase Dashboard Configuration (Manual)

User must configure in Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `http://localhost:3000` (dev) / `https://your-domain.com` (prod)
- **Redirect URLs:** Add:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback`
  - `http://localhost:3000/verify-email` (legacy)
  - `http://localhost:3000/reset-password` (legacy)

---

## Auth Flow After Refactor

### Signup → Verification → Login
```
User signs up → Supabase sends email
  → Email link: /auth/callback?code=XXXX&type=signup
  → Route Handler exchanges code → session established
  → Redirect to /verify-email
  → Page checks session → shows success → "Go to Dashboard"
```

### Login
```
User logs in → Supabase creates session
  → Redirect to /dashboard
  → Middleware verifies session → allows access
```

### Forgot Password → Reset
```
User requests reset → Supabase sends email
  → Email link: /auth/callback?code=XXXX&type=recovery
  → Route Handler exchanges code → session established
  → Redirect to /reset-password
  → Page checks session → shows form → user sets new password
  → Redirect to /login
```

### Protected Routes
```
User visits /dashboard
  → Middleware checks session → if valid, allow
  → If no session → redirect to /login
  → If unverified → sign out → redirect to /verify-email-sent
```

---

## Supabase Dashboard Configuration

### Authentication → URL Configuration
1. **Site URL:** Set to your production domain (e.g., `https://app.example.com`)
2. **Redirect URLs:** Add all callback URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/verify-email`
   - `https://your-domain.com/verify-email`
   - `http://localhost:3000/reset-password`
   - `https://your-domain.com/reset-password`

### Authentication → Email Templates
- **Confirm signup:** URL should use `{{ .SiteURL }}/auth/callback?token={{ .Token }}&type=signup`
- **Magic Link:** URL should use `{{ .SiteURL }}/auth/callback?token={{ .Token }}&type=magiclink`
- **Change Email Address:** URL should use `{{ .SiteURL }}/auth/callback?token={{ .Token }}&type=email_change`

### Authentication → Providers
- Ensure **Email** provider is enabled
- Ensure **Confirm email** is ON (for production)

---

## Security Improvements

1. **Dedicated callback route** — PKCE exchange in Route Handler has proper cookie context (not middleware)
2. **Type-based routing** — `type` query param determines redirect destination (signup vs recovery)
3. **Session validation on every page** — middleware + client-side guards
4. **No token parsing in URL** — all tokens handled server-side via PKCE exchange
5. **Rate limiting** — Supabase handles rate limiting for email resends

## Performance Improvements

1. **No redundant session checks** — callback establishes session, subsequent requests use cookies
2. **Middleware caching** — `supabase.auth.getUser()` refreshes session efficiently
3. **No client-side token parsing** — eliminates hydration mismatches
