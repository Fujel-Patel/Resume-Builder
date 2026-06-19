import { api } from "./client"

export type SuggestSummaryRequest = {
  job_title: string
  skills: string[]
  experience: string[]
  job_description: string
  current_summary?: string | null
}

export type SuggestSummaryResponse = {
  summary: string
}

export type SuggestSkillsRequest = {
  job_description: string
  current_skills: Record<string, string[]>
}

export type SuggestSkillsResponse = {
  skills: Record<string, string[]>
}

export type SuggestExperienceRequest = {
  experience_bullets: string[]
  job_role: string
  company?: string | null
  duration?: string | null
  job_description?: string | null
}

export type SuggestExperienceResponse = {
  bullets: string[]
}

export type SuggestProjectsRequest = {
  project_descriptions: string[]
  project_name?: string | null
  tech_stack?: string[] | null
  job_description?: string | null
}

export type SuggestProjectsResponse = {
  projects: string[]
}

export async function suggestSummaryApi(
  data: SuggestSummaryRequest,
): Promise<SuggestSummaryResponse> {
  return api.post<SuggestSummaryResponse>("/ai/suggest/summary", data)
}

export async function suggestSkillsApi(
  data: SuggestSkillsRequest,
): Promise<SuggestSkillsResponse> {
  return api.post<SuggestSkillsResponse>("/ai/suggest/skills", data)
}

export async function suggestExperienceApi(
  data: SuggestExperienceRequest,
): Promise<SuggestExperienceResponse> {
  return api.post<SuggestExperienceResponse>("/ai/suggest/experience", data)
}

export async function suggestProjectsApi(
  data: SuggestProjectsRequest,
): Promise<SuggestProjectsResponse> {
  return api.post<SuggestProjectsResponse>("/ai/suggest/projects", data)
}

// ---------------------------------------------------------------------------
// Resume optimize – multipart upload
// ---------------------------------------------------------------------------

export type BackendPersonal = {
  first_name: string
  last_name: string
  job_title: string
  email: string
  mobile: string
  address: string
  pincode: string
  github: string
  linkedin: string
  portfolio: string
}

export type BackendExperience = {
  company: string
  role: string
  duration: string
  bullets: string[]
}

export type BackendProject = {
  name: string
  description: string
  live_link: string
  tech_stack: string[]
}

export type BackendEducation = {
  institution: string
  degree: string
  year: string
  grade: string
}

export type BackendCertification = {
  name: string
  issuer: string
  year: string
  link: string
}

export type BackendResumeContent = {
  personal: BackendPersonal
  summary: string
  skills: string[]
  skill_groups: Record<string, string[]> | null
  experience: BackendExperience[]
  projects: BackendProject[]
  education: BackendEducation[]
  certifications: BackendCertification[]
  custom_sections: { label: string; content: string }[]
}

export type OptimizeResumeResponse = {
  parsed: BackendResumeContent
  optimized: BackendResumeContent
  resume_id: string
}

export async function optimizeResumeApi(
  file: File,
  jobDescription: string,
): Promise<OptimizeResumeResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("job_description", jobDescription)
  return api.upload<OptimizeResumeResponse>("/ai/optimize-resume", formData)
}
