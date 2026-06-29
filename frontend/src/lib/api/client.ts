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

const REQUEST_TIMEOUT = 300_000 // 5 minutes

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

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiRequestError(408, {
        code: "REQUEST_TIMEOUT",
        message: "Request timed out after 5 minutes. The AI model may be overloaded — please try again.",
      })
    }
    throw err
  }

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
    const rawDetail = body?.detail
    const detailMessage = typeof rawDetail === "object" && rawDetail !== null
      ? (rawDetail as Record<string, unknown>)?.message ?? JSON.stringify(rawDetail)
      : typeof rawDetail === "string" ? rawDetail : `Request failed with status ${res.status}`
    const error: ApiError = body?.error ?? {
      code: "UNKNOWN_ERROR",
      message: detailMessage,
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
  download: async (path: string): Promise<Blob> => {
    const token = getAccessToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    let res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      credentials: "include",
    })

    if (res.status === 401 && token) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`
        res = await fetch(`${BASE_URL}${path}`, {
          method: "POST",
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

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const detail = body?.detail
      const message = body?.error?.message ?? (typeof detail === "string" ? detail : detail?.message) ?? `Export failed (${res.status})`
      throw new ApiRequestError(res.status, {
        code: body?.error?.code ?? detail?.code ?? "EXPORT_ERROR",
        message,
      })
    }

    return res.blob()
  },
  fetchHtml: async (path: string): Promise<string> => {
    const token = getAccessToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    let res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers,
      credentials: "include",
    })

    if (res.status === 401 && token) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`
        res = await fetch(`${BASE_URL}${path}`, {
          method: "GET",
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

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const message = body?.detail?.message ?? `Preview failed (${res.status})`
      throw new ApiRequestError(res.status, {
        code: body?.detail?.code ?? "PREVIEW_ERROR",
        message,
      })
    }

    return res.text()
  },
}
