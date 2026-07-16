export type SectionType =
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "certifications"
  | "projects"
  | "awards"
  | "interests"
  | "references"
  | "custom"

export type SectionConfig = {
  id: string
  type: SectionType
  title: string
  order: number
  visible: boolean
}

export type ContactInfo = {
  fullName: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  photoUrl: string
}

export type ExperienceItem = {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  current: boolean
  location: string
  bullets: string[]
}

export type EducationItem = {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  current: boolean
  gpa: string
}

export type SkillGroup = {
  id: string
  name: string
  skills: string[]
}

export type LanguageItem = {
  id: string
  name: string
  proficiency: "native" | "fluent" | "advanced" | "intermediate" | "basic"
}

export type CertificationItem = {
  id: string
  name: string
  issuer: string
  date: string
  url: string
}

export type ProjectItem = {
  id: string
  name: string
  role: string
  url: string
  startDate: string
  endDate: string
  bullets: string[]
}

export type AwardItem = {
  id: string
  name: string
  issuer: string
  date: string
  description: string
}

export type InterestItem = {
  id: string
  name: string
}

export type ReferenceItem = {
  id: string
  name: string
  role: string
  company: string
  email: string
  phone: string
}

export type CustomSectionItem = {
  id: string
  title: string
  content: string
  bullets: string[]
}

export type ResumeSections = {
  contact: ContactInfo
  summary: string
  jobDescription: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillGroup[]
  languages: LanguageItem[]
  certifications: CertificationItem[]
  projects: ProjectItem[]
  awards: AwardItem[]
  interests: InterestItem[]
  references: ReferenceItem[]
  custom: CustomSectionItem[]
}

export type ResumeTheme = {
  primaryColor: string
  secondaryColor: string
  textColor: string
  backgroundColor: string
  accentColor: string
  fontFamily: string
  headingFont: string
  fontSize: "small" | "medium" | "large"
  spacing: "compact" | "normal" | "spacious"
  sectionStyle: "underline" | "border" | "filled" | "minimal"
}

export type ResumeData = {
  id: string
  name: string
  targetRole: string
  targetIndustry: string
  sections: SectionConfig[]
  content: ResumeSections
  theme: ResumeTheme
  templateId: string
  createdAt: string
  updatedAt: string
}

export const defaultTheme: ResumeTheme = {
  primaryColor: "#1a3a5c",
  secondaryColor: "#4a6572",
  textColor: "#333333",
  backgroundColor: "#ffffff",
  accentColor: "#00FFF0",
  fontFamily: "Inter, sans-serif",
  headingFont: "Inter, sans-serif",
  fontSize: "medium",
  spacing: "normal",
  sectionStyle: "underline",
}

export const emptyContact: ContactInfo = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
  photoUrl: "",
}

export const defaultSections: SectionConfig[] = [
  { id: "contact", type: "contact", title: "Contact", order: 0, visible: true },
  { id: "summary", type: "summary", title: "Professional Summary", order: 1, visible: true },
  { id: "skills", type: "skills", title: "Skills", order: 2, visible: true },
  { id: "projects", type: "projects", title: "Projects", order: 3, visible: true },
  { id: "experience", type: "experience", title: "Experience", order: 4, visible: true },
  { id: "education", type: "education", title: "Education", order: 5, visible: true },
  { id: "certifications", type: "certifications", title: "Certifications", order: 6, visible: true },
  { id: "languages", type: "languages", title: "Languages", order: 7, visible: false },
  { id: "awards", type: "awards", title: "Awards", order: 8, visible: false },
  { id: "interests", type: "interests", title: "Interests", order: 9, visible: false },
  { id: "references", type: "references", title: "References", order: 10, visible: false },
  { id: "custom", type: "custom", title: "Custom", order: 11, visible: false },
]
