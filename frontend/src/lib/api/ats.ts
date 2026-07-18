import { api } from "./client"

export type ScanResult = {
  id: string
  user_id: string
  resume_id: string | null
  overall_score: number
  score_report: {
    overall_score: number
    section_scores: {
      format: number
      keywords: number
      readability: number
      completeness: number
    }
    missing_keywords: string[]
    suggestions: string[]
  }
  job_description: string | null
  created_at: string
}

export async function scoreUploadApi(
  file: File,
  jobDescription?: string,
  signal?: AbortSignal,
): Promise<ScanResult> {
  const formData = new FormData()
  formData.append("file", file)
  if (jobDescription) formData.append("job_description", jobDescription)
  return api.upload<ScanResult>("/ats/score-upload", formData, { signal })
}

export async function scoreResumeApi(
  resumeText: string,
  jobDescription?: string,
  signal?: AbortSignal,
): Promise<ScanResult> {
  return api.post<ScanResult>(
    "/ats/score",
    { resume_text: resumeText, job_description: jobDescription || null },
    { signal },
  )
}

export async function getHistoryApi(
  skip?: number,
  limit?: number,
  signal?: AbortSignal,
): Promise<ScanResult[]> {
  const params = new URLSearchParams()
  if (skip) params.set("skip", String(skip))
  if (limit) params.set("limit", String(limit))
  const qs = params.toString()
  return api.get<ScanResult[]>(`/ats/history${qs ? `?${qs}` : ""}`, { signal })
}

export async function getScanApi(id: string): Promise<ScanResult> {
  return api.get<ScanResult>(`/ats/history/${id}`)
}
