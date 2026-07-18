import { createClient } from "@/lib/supabase/client"

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

function dispatchUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"))
  }
}

const REQUEST_TIMEOUT = 300_000 // 5 minutes

async function _fetchWithAuth(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  }
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`
  }
  if (!headers["Content-Type"] && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  })

  // On 401, try refreshing session via Supabase
  if (res.status === 401 && session) {
    const { data: { session: newSession } } = await supabase.auth.refreshSession()
    if (newSession?.access_token) {
      headers["Authorization"] = `Bearer ${newSession.access_token}`
      res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers,
        credentials: "include",
      })
    } else {
      dispatchUnauthorized()
    }
  }

  return res
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  if (options.signal) {
    if (options.signal.aborted) controller.abort()
    else options.signal.addEventListener("abort", () => controller.abort(), { once: true })
  }

  const { signal: _externalSignal, ...initOptions } = options
  void _externalSignal

  let res: Response
  try {
    res = await _fetchWithAuth(path, { ...initOptions, signal: controller.signal })
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
  clearTimeout(timeout)

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
  get: <T>(path: string, opts?: { signal?: AbortSignal }) =>
    request<T>(path, { method: "GET", signal: opts?.signal }),
  post: <T>(path: string, data?: unknown, opts?: { signal?: AbortSignal }) =>
    request<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      signal: opts?.signal,
    }),
  patch: <T>(path: string, data?: unknown, opts?: { signal?: AbortSignal }) =>
    request<T>(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      signal: opts?.signal,
    }),
  delete: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    }),
  upload: <T>(path: string, formData: FormData, opts?: { signal?: AbortSignal }) =>
    request<T>(path, {
      method: "POST",
      body: formData,
      signal: opts?.signal,
    }),
  download: async (path: string): Promise<Blob> => {
    const res = await _fetchWithAuth(path, { method: "POST" })

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
    const res = await _fetchWithAuth(path, { method: "GET" })

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
