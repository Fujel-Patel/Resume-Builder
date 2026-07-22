/**
 * Canonical site + auth callback URL helpers.
 *
 * Supabase email links MUST land on /auth/callback (never /verify-email-sent).
 * Redirect URLs must be absolute and present in the Supabase Dashboard allow-list.
 */

/** Strip trailing slash so we never produce //auth/callback. */
function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "")
}

/**
 * Resolve the public site origin.
 *
 * Priority:
 * 1. Browser origin — always correct for the host the user is on
 *    (fixes mis-set NEXT_PUBLIC_SITE_URL=localhost on Vercel)
 * 2. NEXT_PUBLIC_SITE_URL — required for any non-browser composition
 * 3. localhost fallback for local SSR only
 */
export function getSiteUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return stripTrailingSlash(window.location.origin)
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) {
    return stripTrailingSlash(fromEnv)
  }

  return "http://localhost:3000"
}

export type AuthCallbackType = "signup" | "recovery" | "email_change" | "invite"

/**
 * Build the absolute auth callback URL used as emailRedirectTo / redirectTo.
 *
 * Query params:
 * - type: used after session exchange to decide post-auth destination
 * - next: optional override destination (must be a same-origin relative path)
 */
export function getAuthCallbackUrl(
  type: AuthCallbackType = "signup",
  next?: string,
): string {
  const base = `${getSiteUrl()}/auth/callback`
  const params = new URLSearchParams({ type })
  if (next) {
    // Only allow relative paths to prevent open redirects
    if (next.startsWith("/") && !next.startsWith("//")) {
      params.set("next", next)
    }
  }
  return `${base}?${params.toString()}`
}

/**
 * Resolve post-auth destination from callback query params.
 * Defaults: recovery → /reset-password, everything else → /dashboard.
 */
export function resolvePostAuthPath(
  type: string | null,
  next: string | null,
): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next
  }
  if (type === "recovery") {
    return "/reset-password"
  }
  return "/dashboard"
}
