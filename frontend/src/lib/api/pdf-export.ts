import { getAccessToken } from "@/lib/auth/token-manager"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function exportResumeAsPdf(resumeId: string, templateId?: string): Promise<void> {
  const token = getAccessToken()
  const params = templateId ? `?template_id=${encodeURIComponent(templateId)}` : ""
  const res = await fetch(`${API_BASE}/resumes/${resumeId}/export/pdf${params}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const msg = body?.error?.message || body?.detail?.message || `Export failed (${res.status})`
    throw new Error(msg)
  }
  const blob = await res.blob()

  // Parse filename from Content-Disposition header, or fallback
  const disposition = res.headers.get("Content-Disposition") || ""
  const match = disposition.match(/filename="?(.+?)"?\s*(?:;|$)/i)
  const filename = match ? match[1] : `resume-${resumeId.slice(0, 8)}.pdf`

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
