import { api } from "./client"
import { createClient } from "@/lib/supabase/client"

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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/verify-email`,
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
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function resetPassword(newPassword: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function resendVerification(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/verify-email`,
    },
  })
  if (error) throw error
}

// ── Backend API functions (profile data) ─────────────────────────

export async function getMeApi(): Promise<UserOut> {
  return api.get<UserOut>("/users/me")
}

export async function updateMeApi(data: { name?: string; avatar_url?: string | null }): Promise<UserOut> {
  return api.patch<UserOut>("/users/me", data)
}

export async function deleteMeApi(confirmation: string): Promise<void> {
  await api.delete("/users/me", { confirmation })
}

// ── Legacy compatibility exports ─────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}
