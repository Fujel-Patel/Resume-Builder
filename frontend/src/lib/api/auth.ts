import { api } from "./client"
import { setAccessToken, clearAccessToken } from "@/lib/auth/token-manager"

export type UserOut = {
  id: string
  name: string
  email: string
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string | null
}

type TokenResponse = {
  access_token: string
  token_type: string
}

export async function signupApi(
  name: string,
  email: string,
  password: string,
): Promise<UserOut> {
  return api.post<UserOut>("/auth/signup", { name, email, password })
}

export async function loginApi(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const data = await api.post<TokenResponse>("/auth/login", { email, password })
  setAccessToken(data.access_token)
  return data
}

export async function logoutApi(): Promise<void> {
  await api.post("/auth/logout").catch(() => {})
  clearAccessToken()
}

export async function refreshApi(): Promise<TokenResponse | null> {
  try {
    const data = await api.post<TokenResponse>("/auth/refresh")
    setAccessToken(data.access_token)
    return data
  } catch {
    clearAccessToken()
    return null
  }
}

export async function getMeApi(): Promise<UserOut> {
  return api.get<UserOut>("/users/me")
}

export async function updateMeApi(data: { name?: string; avatar_url?: string | null }): Promise<UserOut> {
  return api.patch<UserOut>("/users/me", data)
}

export async function deleteMeApi(confirmation: string): Promise<void> {
  await api.delete("/users/me", { confirmation })
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email })
}

export async function resetPasswordApi(token: string, password: string): Promise<void> {
  await api.post("/auth/reset-password", { token, password })
}
