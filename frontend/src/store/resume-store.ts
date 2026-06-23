import { create } from "zustand"
import { persist } from "zustand/middleware"

const debouncedStorage = (() => {
  let timeout: ReturnType<typeof setTimeout>
  return {
    getItem: (key: string) => {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    },
    setItem: (key: string, value: unknown) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(value))
      }, 300)
    },
    removeItem: (key: string) => localStorage.removeItem(key),
  }
})()
import type {
  ResumeData,
  ResumeSections,
  ResumeTheme,
  ExperienceItem,
  EducationItem,
  SkillGroup,
  LanguageItem,
  CertificationItem,
  ProjectItem,
  AwardItem,
  InterestItem,
  ReferenceItem,
  CustomSectionItem,
} from "@/types/resume"
import { emptyContact, defaultSections, defaultTheme } from "@/types/resume"

let counter = 0
const genId = () => `resume_${++counter}_${Date.now()}`

const emptySections: ResumeSections = {
  contact: { ...emptyContact },
  summary: "",
  jobDescription: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
  awards: [],
  interests: [],
  references: [],
  custom: [],
}

const createDefaultResume = (): ResumeData => ({
  id: genId(),
  name: "Untitled Resume",
  targetRole: "",
  targetIndustry: "",
  sections: defaultSections.map((s) => ({ ...s })),
  content: JSON.parse(JSON.stringify(emptySections)),
  theme: { ...defaultTheme },
  templateId: "nova-timeline",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

type ResumeStore = {
  resume: ResumeData
  isDirty: boolean
  isSaving: boolean
  savingSection: string | null

  setResume: (resume: ResumeData) => void
  resetResume: () => void

  updateContact: (contact: Partial<ResumeSections["contact"]>) => void
  setSummary: (summary: string) => void
  setJobDescription: (jobDescription: string) => void

  addExperience: () => void
  updateExperience: (id: string, data: Partial<ExperienceItem>) => void
  removeExperience: (id: string) => void
  reorderExperience: (from: number, to: number) => void

  addEducation: () => void
  updateEducation: (id: string, data: Partial<EducationItem>) => void
  removeEducation: (id: string) => void

  addSkillGroup: () => void
  updateSkillGroup: (id: string, data: Partial<SkillGroup>) => void
  removeSkillGroup: (id: string) => void
  addSkillToGroup: (groupId: string, skill: string) => void
  removeSkillFromGroup: (groupId: string, index: number) => void

  addLanguage: () => void
  updateLanguage: (id: string, data: Partial<LanguageItem>) => void
  removeLanguage: (id: string) => void

  addCertification: () => void
  updateCertification: (id: string, data: Partial<CertificationItem>) => void
  removeCertification: (id: string) => void

  addProject: () => void
  updateProject: (id: string, data: Partial<ProjectItem>) => void
  removeProject: (id: string) => void

  addAward: () => void
  updateAward: (id: string, data: Partial<AwardItem>) => void
  removeAward: (id: string) => void

  addInterest: () => void
  updateInterest: (id: string, data: Partial<InterestItem>) => void
  removeInterest: (id: string) => void

  addReference: () => void
  updateReference: (id: string, data: Partial<ReferenceItem>) => void
  removeReference: (id: string) => void

  addCustomSection: () => void
  updateCustomSection: (id: string, data: Partial<CustomSectionItem>) => void
  removeCustomSection: (id: string) => void

  addBullet: (section: "experience" | "projects", itemId: string) => void
  updateBullet: (section: "experience" | "projects", itemId: string, index: number, value: string) => void
  removeBullet: (section: "experience" | "projects", itemId: string, index: number) => void

  toggleSectionVisibility: (sectionId: string) => void
  updateSectionOrder: (sectionId: string, order: number) => void
  reorderSections: (from: number, to: number) => void
  addCustomSectionType: (title: string) => void

  updateTheme: (theme: Partial<ResumeTheme>) => void
  updateTemplateId: (templateId: string) => void
  updateResumeMeta: (data: Partial<Pick<ResumeData, "name" | "targetRole" | "targetIndustry">>) => void

  setSaving: (saving: boolean) => void
  setSavingSection: (section: string | null) => void
  markClean: () => void
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: createDefaultResume(),
      isDirty: false,
      isSaving: false,
      savingSection: null,

      setResume: (resume) => set({ resume, isDirty: false }),

      resetResume: () => set({ resume: createDefaultResume(), isDirty: false }),

      updateContact: (contact) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              contact: { ...state.resume.content.contact, ...contact },
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      setSummary: (summary) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: { ...state.resume.content, summary },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      setJobDescription: (jobDescription) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: { ...state.resume.content, jobDescription },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addExperience: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              experience: [
                ...state.resume.content.experience,
                {
                  id: genId(),
                  company: "",
                  role: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  location: "",
                  bullets: [],
                },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateExperience: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              experience: state.resume.content.experience.map((e) =>
                e.id === id ? { ...e, ...data } : e
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeExperience: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              experience: state.resume.content.experience.filter((e) => e.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      reorderExperience: (from, to) =>
        set((state) => {
          const items = [...state.resume.content.experience]
          const [moved] = items.splice(from, 1)
          items.splice(to, 0, moved)
          return {
            resume: {
              ...state.resume,
              content: { ...state.resume.content, experience: items },
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          }
        }),

      addEducation: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              education: [
                ...state.resume.content.education,
                {
                  id: genId(),
                  institution: "",
                  degree: "",
                  field: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  gpa: "",
                },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateEducation: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              education: state.resume.content.education.map((e) =>
                e.id === id ? { ...e, ...data } : e
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeEducation: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              education: state.resume.content.education.filter((e) => e.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addSkillGroup: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              skills: [
                ...state.resume.content.skills,
                { id: genId(), name: "", skills: [] },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateSkillGroup: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              skills: state.resume.content.skills.map((s) =>
                s.id === id ? { ...s, ...data } : s
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeSkillGroup: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              skills: state.resume.content.skills.filter((s) => s.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addSkillToGroup: (groupId, skill) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              skills: state.resume.content.skills.map((s) =>
                s.id === groupId ? { ...s, skills: [...s.skills, skill] } : s
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeSkillFromGroup: (groupId, index) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              skills: state.resume.content.skills.map((s) =>
                s.id === groupId
                  ? { ...s, skills: s.skills.filter((_, i) => i !== index) }
                  : s
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addLanguage: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              languages: [
                ...state.resume.content.languages,
                { id: genId(), name: "", proficiency: "fluent" },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateLanguage: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              languages: state.resume.content.languages.map((l) =>
                l.id === id ? { ...l, ...data } : l
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeLanguage: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              languages: state.resume.content.languages.filter((l) => l.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addCertification: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              certifications: [
                ...state.resume.content.certifications,
                { id: genId(), name: "", issuer: "", date: "", url: "" },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateCertification: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              certifications: state.resume.content.certifications.map((c) =>
                c.id === id ? { ...c, ...data } : c
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeCertification: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              certifications: state.resume.content.certifications.filter((c) => c.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addProject: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              projects: [
                ...state.resume.content.projects,
                { id: genId(), name: "", role: "", url: "", startDate: "", endDate: "", bullets: [] },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateProject: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              projects: state.resume.content.projects.map((p) =>
                p.id === id ? { ...p, ...data } : p
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeProject: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              projects: state.resume.content.projects.filter((p) => p.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addAward: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              awards: [
                ...state.resume.content.awards,
                { id: genId(), name: "", issuer: "", date: "", description: "" },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateAward: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              awards: state.resume.content.awards.map((a) =>
                a.id === id ? { ...a, ...data } : a
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeAward: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              awards: state.resume.content.awards.filter((a) => a.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addInterest: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              interests: [
                ...state.resume.content.interests,
                { id: genId(), name: "" },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateInterest: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              interests: state.resume.content.interests.map((i) =>
                i.id === id ? { ...i, ...data } : i
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeInterest: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              interests: state.resume.content.interests.filter((i) => i.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addReference: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              references: [
                ...state.resume.content.references,
                { id: genId(), name: "", role: "", company: "", email: "", phone: "" },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateReference: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              references: state.resume.content.references.map((r) =>
                r.id === id ? { ...r, ...data } : r
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeReference: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              references: state.resume.content.references.filter((r) => r.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addCustomSection: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              custom: [
                ...state.resume.content.custom,
                { id: genId(), title: "", content: "", bullets: [] },
              ],
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateCustomSection: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              custom: state.resume.content.custom.map((c) =>
                c.id === id ? { ...c, ...data } : c
              ),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      removeCustomSection: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            content: {
              ...state.resume.content,
              custom: state.resume.content.custom.filter((c) => c.id !== id),
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      addBullet: (section, itemId) =>
        set((state) => {
          const content = { ...state.resume.content }
          if (section === "experience") {
            content.experience = content.experience.map((e) =>
              e.id === itemId ? { ...e, bullets: [...e.bullets, ""] } : e
            )
          } else {
            content.projects = content.projects.map((p) =>
              p.id === itemId ? { ...p, bullets: [...p.bullets, ""] } : p
            )
          }
          return {
            resume: { ...state.resume, content, updatedAt: new Date().toISOString() },
            isDirty: true,
          }
        }),

      updateBullet: (section, itemId, index, value) =>
        set((state) => {
          const content = { ...state.resume.content }
          if (section === "experience") {
            content.experience = content.experience.map((e) =>
              e.id === itemId
                ? { ...e, bullets: e.bullets.map((b, i) => (i === index ? value : b)) }
                : e
            )
          } else {
            content.projects = content.projects.map((p) =>
              p.id === itemId
                ? { ...p, bullets: p.bullets.map((b, i) => (i === index ? value : b)) }
                : p
            )
          }
          return {
            resume: { ...state.resume, content, updatedAt: new Date().toISOString() },
            isDirty: true,
          }
        }),

      removeBullet: (section, itemId, index) =>
        set((state) => {
          const content = { ...state.resume.content }
          if (section === "experience") {
            content.experience = content.experience.map((e) =>
              e.id === itemId
                ? { ...e, bullets: e.bullets.filter((_, i) => i !== index) }
                : e
            )
          } else {
            content.projects = content.projects.map((p) =>
              p.id === itemId
                ? { ...p, bullets: p.bullets.filter((_, i) => i !== index) }
                : p
            )
          }
          return {
            resume: { ...state.resume, content, updatedAt: new Date().toISOString() },
            isDirty: true,
          }
        }),

      toggleSectionVisibility: (sectionId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((s) =>
              s.id === sectionId ? { ...s, visible: !s.visible } : s
            ),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateSectionOrder: (sectionId, order) =>
        set((state) => ({
          resume: {
            ...state.resume,
            sections: state.resume.sections.map((s) =>
              s.id === sectionId ? { ...s, order } : s
            ),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      reorderSections: (from, to) =>
        set((state) => {
          const sorted = [...state.resume.sections].sort((a, b) => a.order - b.order)
          const [moved] = sorted.splice(from, 1)
          sorted.splice(to, 0, moved)
          return {
            resume: {
              ...state.resume,
              sections: sorted.map((s, i) => ({ ...s, order: i })),
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          }
        }),

      addCustomSectionType: (title) =>
        set((state) => {
          const maxOrder = Math.max(...state.resume.sections.map((s) => s.order), 0)
          return {
            resume: {
              ...state.resume,
              sections: [
                ...state.resume.sections,
                {
                  id: genId(),
                  type: "custom" as const,
                  title,
                  order: maxOrder + 1,
                  visible: true,
                },
              ],
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          }
        }),

      updateTheme: (theme) =>
        set((state) => ({
          resume: {
            ...state.resume,
            theme: { ...state.resume.theme, ...theme },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        })),

      updateTemplateId: (templateId) =>
        set((state) => ({
          resume: { ...state.resume, templateId, updatedAt: new Date().toISOString() },
          isDirty: true,
        })),

      updateResumeMeta: (data) =>
        set((state) => ({
          resume: { ...state.resume, ...data, updatedAt: new Date().toISOString() },
          isDirty: true,
        })),

      setSaving: (saving) => set({ isSaving: saving }),
      setSavingSection: (section) => set({ savingSection: section }),
      markClean: () => set({ isDirty: false }),
    }),
    {
      name: "resume-store",
      partialize: (state) => ({ resume: state.resume }),
      storage: debouncedStorage,
    }
  )
)
