import type { BackendResumeContent } from "./ai-suggest"
import { API_BASE_URL } from "./client"

export type StreamProgress = {
  stage: string
  progress: number
  stage_label: string
  data?: Record<string, unknown>
}

export type StreamCallbacks = {
  onProgress?: (progress: StreamProgress) => void
  onCompleted?: (parsed: BackendResumeContent, optimized: BackendResumeContent, resumeId: string) => void
  onError?: (code: string, message: string) => void
}

export type SseEvent = {
  event: string
  data: unknown
}

function parseSseBuffer(buffer: string): { events: SseEvent[]; remaining: string } {
  const events: SseEvent[] = []
  const parts = buffer.split("\n\n")
  const complete = parts.slice(0, -1)
  const remaining = parts[parts.length - 1]

  for (const block of complete) {
    if (!block.trim()) continue
    const lines = block.split("\n")
    let event = "message"
    let dataStr = ""

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        event = line.slice(7).trim()
      } else if (line.startsWith("data: ")) {
        dataStr = line.slice(6).trim()
      }
    }

    if (dataStr) {
      try {
        events.push({ event, data: JSON.parse(dataStr) })
      } catch {
        events.push({ event, data: dataStr })
      }
    }
  }

  return { events, remaining }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

async function refreshAndGetHeaders(): Promise<Record<string, string> | null> {
  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()
  const { data: { session: newSession } } = await supabase.auth.refreshSession()
  if (newSession?.access_token) {
    return { Authorization: `Bearer ${newSession.access_token}` }
  }
  return null
}

export async function optimizeResumeStream(
  file: File,
  jobDescription: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("job_description", jobDescription)

  const headers = await getAuthHeaders()

  let res = await fetch(`${API_BASE_URL}/ai/optimize-resume/stream`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
    signal,
  })

  if (res.status === 401) {
    const newHeaders = await refreshAndGetHeaders()
    if (newHeaders) {
      res = await fetch(`${API_BASE_URL}/ai/optimize-resume/stream`, {
        method: "POST",
        headers: newHeaders,
        body: formData,
        credentials: "include",
        signal,
      })
    } else {
      callbacks.onError?.("UNAUTHORIZED", "Session expired. Please log in again.")
      return
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      message = body?.error?.message ?? body?.detail?.message ?? message
    } catch {
      // ignore parse errors
    }
    callbacks.onError?.(`HTTP_${res.status}`, message)
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    callbacks.onError?.("STREAM_ERROR", "Response body is empty")
    return
  }

  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const { events, remaining } = parseSseBuffer(buffer)
      buffer = remaining

      for (const evt of events) {
        if (evt.event === "progress") {
          callbacks.onProgress?.(evt.data as StreamProgress)
        } else if (evt.event === "error") {
          const errData = evt.data as { code?: string; message?: string }
          callbacks.onError?.(errData.code ?? "STREAM_ERROR", errData.message ?? "An unexpected error occurred")
          return
        } else if (evt.event === "completed") {
          const d = evt.data as {
            parsed: BackendResumeContent
            optimized: BackendResumeContent
            resume_id: string
          }
          callbacks.onCompleted?.(d.parsed, d.optimized, d.resume_id)
          return
        }
      }
    }

    callbacks.onError?.("STREAM_ENDED", "Stream ended unexpectedly")
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return
    callbacks.onError?.("NETWORK_ERROR", err instanceof Error ? err.message : "Network error")
  }
}
