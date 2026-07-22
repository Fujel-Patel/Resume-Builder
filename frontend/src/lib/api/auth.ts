import { api } from "./client"
import { createClient } from "@/lib/supabase/client"
import { getAuthCallbackUrl } from "@/lib/auth/urls"
import { normalizeAuthError } from "@/lib/auth/errors"

export type UserOut = {
  id: string
  name: string
  email: string
  avatar_url?: string | null
  created_at: string
  updated_at: string | null
}

// ── Supabase Auth functions ──────────────────────────────────────

export async function signup(name: string, email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      // MUST be /auth/callback — never /verify-email-sent
      emailRedirectTo: getAuthCallbackUrl("signup", "/dashboard"),
    },
  })
  if (error) throw error
  return data
}

export async function login(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function logout() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function forgotPassword(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Recovery links land on the same callback, then route to /reset-password
    redirectTo: getAuthCallbackUrl("recovery", "/reset-password"),
  })
  if (error) throw error
}

export async function resetPassword(newPassword: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) throw new Error("No active session")

  // Re-authenticate to confirm current password (Supabase has no direct check)
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (verifyError) throw new Error("Current password is incorrect")

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (updateError) throw updateError
}

/**
 * Resend signup confirmation email.
 *
 * Uses the official Supabase Auth API:
 *   supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo } })
 *
 * Notes:
 * - Redirect MUST be /auth/callback (allow-listed in Supabase Dashboard).
 * - Free-tier built-in SMTP only delivers reliably to project team members —
 *   production requires custom SMTP.
 * - Supabase rate-limits resends; errors surface as RATE_LIMIT_EXCEEDED.
 * - For non-existent / already-confirmed emails Supabase may return success
 *   without sending (anti-enumeration). We still report success to the UI.
 */
export async function resendVerification(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: getAuthCallbackUrl("signup", "/dashboard"),
    },
  })
  if (error) {
    // Re-throw as a normalized error so UI can show rate-limit vs generic
    const normalized = normalizeAuthError(error)
    const e = new Error(normalized.message) as Error & {
      code: string
      status?: number
    }
    e.code = normalized.code
    e.status = normalized.status
    throw e
  }
}

// ── Backend API functions (profile data) ─────────────────────────

export async function getMeApi(): Promise<UserOut> {
  return api.get<UserOut>("/users/me")
}

export async function updateMeApi(data: {
  name?: string
  avatar_url?: string | null
}): Promise<UserOut> {
  return api.patch<UserOut>("/users/me", data)
}

export async function deleteMeApi(confirmation: string): Promise<void> {
  await api.delete("/users/me", { confirmation })
}

// ── Session helpers ──────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function getSessionUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) return null
  return user
}
