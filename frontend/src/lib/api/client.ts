import { getAccessToken, setAccessToken, clearAccessToken } from "@/lib/auth/token-manager"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

type ApiError = {
  code: string
  message: string
  fields?: Record<string, string[]>
}

export class ApiRequestError extends Error {
  status: number
  code: string
  fields?: Record<string, string[]>

  constructor(status: number, error: ApiError) {
    super(error.message)
    this.name = "ApiRequestError"
    this.status = status
    this.code = error.code
    this.fields = error.fields
  }
}

async function refreshAccessToken(): Promise<string | null> {
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

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      })
    } else {
      clearAccessToken()
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"))
      }
    }
  }

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error: ApiError = body?.error ?? {
      code: "UNKNOWN_ERROR",
      message: body?.detail ?? `Request failed with status ${res.status}`,
    }
    throw new ApiRequestError(res.status, error)
  }

  if (body.success && body.data !== undefined) {
    return body.data as T
  }

  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, {
      method: "POST",
      body: formData,
    }),
}
