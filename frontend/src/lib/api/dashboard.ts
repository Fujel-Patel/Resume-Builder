import { api } from "./client"
import type { UserOut } from "./auth"

export type ResumeResponse = {
  id: string
  title: string
  template_id: string
  created_at: string
  updated_at: string
  data: {
    personal?: {
      first_name?: string
      last_name?: string
      job_title?: string
    }
  } | null
}

export type ATSScanResponse = {
  id: string
  resume_id: string | null
  overall_score: number
  score_report: {
    missing_keywords?: string[]
  }
  created_at: string
}

export type DashboardData = {
  stats: {
    total_resumes: number
    avg_ats_score: number
    interviews: number
    ai_generations: number
  }
  recentResumes: Array<{
    id: string
    name: string
    role: string
    date: string
    score: number
    status: "Optimized" | "Draft" | "Complete"
    template_id: string
  }>
  atsHistory: number[]
  missingKeywords: string[]
}

type DashboardBatchResponse = {
  user: UserOut
  resumes: ResumeResponse[]
  ats_history: ATSScanResponse[]
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export async function getDashboardData(): Promise<DashboardData> {
  // Single batch endpoint replaces 3 separate calls (users/me + resumes + ats/history)
  const batch = await api.get<DashboardBatchResponse>("/resumes/dashboard")
  const rawResumes = batch.resumes
  const scans = batch.ats_history

  const resumes = [...new Map(rawResumes.map((r) => [r.id, r])).values()]
  const totalResumes = resumes.length

  const avgAtsScore =
    scans.length > 0
      ? Math.round(scans.reduce((sum, s) => sum + s.overall_score, 0) / scans.length)
      : 0

  const scanMap = new Map<string, number>()
  for (const s of scans) {
    if (s.resume_id && !scanMap.has(s.resume_id)) {
      scanMap.set(s.resume_id, s.overall_score)
    }
  }

  const recentResumes = resumes
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map((r) => {
      const score = r.id ? scanMap.get(r.id) ?? 0 : 0
      let status: "Optimized" | "Draft" | "Complete" = "Draft"
      if (score > 0) status = "Optimized"
      else if (r.data) status = "Complete"

      return {
        id: r.id,
        name: r.title,
        role: r.data?.personal?.job_title ?? "Resume",
        date: formatDate(r.updated_at),
        score,
        status,
        template_id: r.template_id,
      }
    })

  const atsHistory = scans.slice(0, 6).map((s) => s.overall_score)

  const missingKeywords = scans[0]?.score_report?.missing_keywords ?? []

  return {
    stats: {
      total_resumes: totalResumes,
      avg_ats_score: avgAtsScore,
      interviews: 0,
      ai_generations: 0,
    },
    recentResumes,
    atsHistory,
    missingKeywords,
  }
}
