import { getAccessToken, clearAccessToken } from "@/lib/auth/token-manager"
import { refreshAccessToken } from "@/lib/auth/refresh"
import type { BackendResumeContent } from "./ai-suggest"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

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

export async function optimizeResumeStream(
  file: File,
  jobDescription: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("job_description", jobDescription)

  const token = getAccessToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let res = await fetch(`${BASE_URL}/ai/optimize-resume/stream`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
    signal,
  })

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`
      res = await fetch(`${BASE_URL}/ai/optimize-resume/stream`, {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
        signal,
      })
    } else {
      clearAccessToken()
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
