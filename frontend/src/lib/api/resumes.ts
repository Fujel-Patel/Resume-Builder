import { api } from "./client"
import { createClient } from "@/lib/supabase/client"
import type { ResumeData } from "@/features/resume/types"

type JsonDict = Record<string, unknown>

export type ResumeResponse = {
  id: string
  title: string
  template_id: string
  created_at: string
  updated_at: string
  data: JsonDict | null
}

export async function getResumeApi(id: string): Promise<ResumeResponse> {
  return api.get<ResumeResponse>(`/resumes/${id}`)
}

export async function createResumeApi(data: {
  title: string
  template_id: string
  content?: JsonDict
}): Promise<ResumeResponse> {
  return api.post<ResumeResponse>("/resumes", data)
}

export async function updateResumeApi(
  id: string,
  data: { title?: string; template_id?: string; content?: JsonDict },
): Promise<ResumeResponse> {
  return api.patch<ResumeResponse>(`/resumes/${id}`, data)
}

function toBackendAll(data: ResumeData): JsonDict {
  return {
    personal: {
      first_name: data.personal.name.split(" ")[0] || "",
      last_name: data.personal.name.split(" ").slice(1).join(" ") || "",
      job_title: data.personal.title,
      email: data.personal.email,
      mobile: data.personal.phone,
      address: data.personal.location,
      github: data.links.github,
      linkedin: data.links.linkedin,
      portfolio: data.links.portfolio,
    },
    summary: data.summary,
    skills: data.skills,
    skill_groups: data.skillGroups ?? {},
    experience: data.experience.map((e) => ({
      company: e.company,
      role: e.role,
      duration: `${e.startDate} - ${e.endDate}`,
      bullets: e.description ? [e.description] : [],
    })),
    education: data.education.map((e) => ({
      institution: e.school,
      degree: e.degree,
      year: e.startDate,
      grade: e.endDate,
    })),
    projects: data.projects.map((p) => ({
      name: p.name,
      description: p.description,
    })),
    certifications: data.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      year: c.date,
    })),
    custom_sections: data.customSections.map((s) => ({
      label: s.label,
      content: s.content,
    })),
  }
}

function toBackendSection(data: ResumeData, section: keyof ResumeData): JsonDict {
  switch (section) {
    case "personal":
      return {
        personal: {
          first_name: data.personal.name.split(" ")[0] || "",
          last_name: data.personal.name.split(" ").slice(1).join(" ") || "",
          job_title: data.personal.title,
          email: data.personal.email,
          mobile: data.personal.phone,
          address: data.personal.location,
        },
      }
    case "links":
      return {
        personal: {
          github: data.links.github,
          linkedin: data.links.linkedin,
          portfolio: data.links.portfolio,
        },
      }
    case "summary":
      return { summary: data.summary }
    case "skills":
      return { skills: data.skills, skill_groups: data.skillGroups ?? {} }
    case "skillGroups":
      return { skill_groups: data.skillGroups ?? {} }
    case "experience":
      return {
        experience: data.experience.map((e) => ({
          company: e.company,
          role: e.role,
          duration: `${e.startDate} - ${e.endDate}`,
          bullets: e.description ? [e.description] : [],
        })),
      }
    case "education":
      return {
        education: data.education.map((e) => ({
          institution: e.school,
          degree: e.degree,
          year: e.startDate,
          grade: e.endDate,
        })),
      }
    case "projects":
      return {
        projects: data.projects.map((p) => ({
          name: p.name,
          description: p.description,
        })),
      }
    case "certifications":
      return {
        certifications: data.certifications.map((c) => ({
          name: c.name,
          issuer: c.issuer,
          year: c.date,
        })),
      }
    case "customSections":
      return {
        custom_sections: data.customSections.map((s) => ({
          label: s.label,
          content: s.content,
        })),
      }
  }
}

export async function saveSection(
  resumeId: string | null,
  data: ResumeData,
  section: keyof ResumeData,
): Promise<string> {
  if (!resumeId) {
    const title = data.personal.title || data.personal.name || "My Resume"
    const created = await createResumeApi({
      title,
      template_id: "classic",
      content: toBackendAll(data),
    })
    return created.id
  }

  const content = toBackendSection(data, section)
  await updateResumeApi(resumeId, { content })
  return resumeId
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function listResumesApi(): Promise<ResumeResponse[]> {
  return api.get<ResumeResponse[]>("/resumes")
}

export async function deleteResumeApi(id: string): Promise<void> {
  await api.delete(`/resumes/${id}`)
}

export async function duplicateResumeApi(id: string): Promise<ResumeResponse> {
  const original = await getResumeApi(id)
  return createResumeApi({
    title: `${original.title} (Copy)`,
    template_id: original.template_id,
    content: original.data as JsonDict | undefined,
  })
}

export async function exportResume(id: string): Promise<void> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const res = await fetch(`${API_BASE}/resumes/${id}/export`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  })
  if (!res.ok) throw new Error("Export failed")
  const blob = await res.blob()
  const ext = blob.type.includes("wordprocessingml") ? "docx" : "pdf"
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `resume-${id.slice(0, 8)}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function str(d: unknown, fallback = ""): string {
  return typeof d === "string" ? d : fallback
}

function arr(d: unknown): JsonDict[] {
  return Array.isArray(d) ? (d as JsonDict[]) : []
}

export function toFrontendFromContent(d: JsonDict): ResumeData {
  const personal = (d.personal as JsonDict) ?? {}

  return {
    personal: {
      name: `${str(personal.first_name)} ${str(personal.last_name)}`.trim() || "",
      title: str(personal.job_title),
      email: str(personal.email),
      phone: str(personal.mobile),
      location: str(personal.address),
    },
    links: {
      linkedin: str(personal.linkedin),
      github: str(personal.github),
      portfolio: str(personal.portfolio),
      website: "",
    },
    summary: str(d.summary),
    skills: Array.isArray(d.skills) ? (d.skills as string[]) : [],
    skillGroups: (d.skill_groups as Record<string, string[]>) ?? null,
    experience: arr(d.experience).map((e: JsonDict) => {
      const dur = str(e.duration)
      const parts = dur.split(" - ")
      return {
        company: str(e.company),
        role: str(e.role),
        startDate: parts[0] || "",
        endDate: parts[1] || "",
        description: arr(e.bullets).join("\n"),
      }
    }),
    education: arr(d.education).map((e: JsonDict) => ({
      school: str(e.institution),
      degree: str(e.degree),
      field: "",
      startDate: str(e.year),
      endDate: str(e.grade),
    })),
    projects: arr(d.projects).map((p: JsonDict) => ({
      name: str(p.name),
      description: str(p.description),
    })),
    certifications: arr(d.certifications).map((c: JsonDict) => ({
      name: str(c.name),
      issuer: str(c.issuer),
      date: str(c.year),
    })),
    customSections: arr(d.custom_sections).map((s: JsonDict) => ({
      label: str(s.label),
      content: str(s.content),
    })),
  }
}

export function toFrontendResumeData(r: ResumeResponse): ResumeData {
  return toFrontendFromContent(r.data ?? {})
}
