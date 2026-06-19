export type ResumeTemplate = "classic" | "modern" | "minimal" | "creative" | "default"

export type ResumeData = {
  personal: {
    name: string
    title: string
    email: string
    phone: string
    location: string
  }
  links: {
    linkedin: string
    github: string
    portfolio: string
    website: string
  }
  summary: string
  skills: string[]
  skillGroups: Record<string, string[]> | null
  experience: ExperienceEntry[]
  education: EducationEntry[]
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
}

export type ExperienceEntry = {
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
}

export type EducationEntry = {
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
}

export type ProjectEntry = {
  name: string
  description: string
}

export type CertificationEntry = {
  name: string
  issuer: string
  date: string
}
