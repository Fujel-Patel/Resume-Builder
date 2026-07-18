import { setAccessToken } from "./token-manager"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) return null
  const body = await res.json()
  const token: string | undefined = body.data?.access_token
  if (token) setAccessToken(token)
  return token ?? null
}
