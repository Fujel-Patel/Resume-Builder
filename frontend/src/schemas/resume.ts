import { z } from "zod"

export const contactSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
  title: z.string().min(1, "Title is required").max(100),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string().max(30).optional().default(""),
  location: z.string().max(100).optional().default(""),
  website: z.string().url("Invalid URL").or(z.literal("")).optional().default(""),
  linkedin: z.string().max(200).optional().default(""),
  github: z.string().max(200).optional().default(""),
  photoUrl: z.string().max(100000).optional().default(""),
})

export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  startDate: z.string().max(20).optional().default(""),
  endDate: z.string().max(20).optional().default(""),
  current: z.boolean().optional().default(false),
  location: z.string().max(100).optional().default(""),
  bullets: z.array(z.string()).optional().default([]),
})

export const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution is required").max(100),
  degree: z.string().min(1, "Degree is required").max(100),
  field: z.string().max(100).optional().default(""),
  startDate: z.string().max(20).optional().default(""),
  endDate: z.string().max(20).optional().default(""),
  current: z.boolean().optional().default(false),
  gpa: z.string().max(10).optional().default(""),
})

export const skillGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  skills: z.array(z.string()),
})

export const languageItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Language is required").max(50),
  proficiency: z.enum(["native", "fluent", "advanced", "intermediate", "basic"]).optional().default("fluent"),
})

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(100),
  issuer: z.string().max(100).optional().default(""),
  date: z.string().max(20).optional().default(""),
  url: z.string().url().or(z.literal("")).optional().default(""),
})

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().max(100).optional().default(""),
  url: z.string().url().or(z.literal("")).optional().default(""),
  startDate: z.string().max(20).optional().default(""),
  endDate: z.string().max(20).optional().default(""),
  bullets: z.array(z.string()).optional().default([]),
})

export const awardItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  issuer: z.string().max(100).optional().default(""),
  date: z.string().max(20).optional().default(""),
  description: z.string().max(500).optional().default(""),
})

export const interestItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
})

export const referenceItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  role: z.string().max(100).optional().default(""),
  company: z.string().max(100).optional().default(""),
  email: z.string().email().or(z.literal("")).optional().default(""),
  phone: z.string().max(30).optional().default(""),
})

export const customSectionItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  content: z.string().max(2000).optional().default(""),
  bullets: z.array(z.string()).optional().default([]),
})

export const resumeSectionsSchema = z.object({
  contact: contactSchema,
  summary: z.string().max(1000).optional().default(""),
  jobDescription: z.string().max(5000).optional().default(""),
  experience: z.array(experienceItemSchema).optional().default([]),
  education: z.array(educationItemSchema).optional().default([]),
  skills: z.array(skillGroupSchema).optional().default([]),
  languages: z.array(languageItemSchema).optional().default([]),
  certifications: z.array(certificationItemSchema).optional().default([]),
  projects: z.array(projectItemSchema).optional().default([]),
  awards: z.array(awardItemSchema).optional().default([]),
  interests: z.array(interestItemSchema).optional().default([]),
  references: z.array(referenceItemSchema).optional().default([]),
  custom: z.array(customSectionItemSchema).optional().default([]),
})

export const sectionConfigSchema = z.object({
  id: z.string(),
  type: z.enum([
    "contact", "summary", "experience", "education", "skills",
    "languages", "certifications", "projects", "awards",
    "interests", "references", "custom",
  ]),
  title: z.string(),
  order: z.number(),
  visible: z.boolean(),
})

export const resumeThemeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  textColor: z.string(),
  backgroundColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string(),
  headingFont: z.string(),
  fontSize: z.enum(["small", "medium", "large"]),
  spacing: z.enum(["compact", "normal", "spacious"]),
  sectionStyle: z.enum(["underline", "border", "filled", "minimal"]),
})

export const resumeDataSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Resume name is required"),
  targetRole: z.string().optional().default(""),
  targetIndustry: z.string().optional().default(""),
  sections: z.array(sectionConfigSchema),
  content: resumeSectionsSchema,
  theme: resumeThemeSchema,
  templateId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ContactFormData = z.infer<typeof contactSchema>
export type ExperienceFormData = z.infer<typeof experienceItemSchema>
export type EducationFormData = z.infer<typeof educationItemSchema>
export type ResumeFormData = z.infer<typeof resumeDataSchema>

export const experienceArraySchema = z.array(experienceItemSchema)
export const educationArraySchema = z.array(educationItemSchema)
