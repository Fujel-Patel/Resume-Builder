import { api } from "./client"

export async function exportResumeAsPdf(resumeId: string, templateId?: string): Promise<void> {
  const path = templateId
    ? `/resumes/${resumeId}/export/pdf?template_id=${encodeURIComponent(templateId)}`
    : `/resumes/${resumeId}/export/pdf`

  const blob = await api.download(path)

  const ext = "pdf"
  const filename = `resume-${resumeId.slice(0, 8)}.${ext}`

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
