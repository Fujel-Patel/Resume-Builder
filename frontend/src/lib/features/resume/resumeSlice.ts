import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ResumeData, ExperienceEntry, EducationEntry, ProjectEntry, CertificationEntry } from "@/features/resume/types"

type ResumeState = {
  data: ResumeData
  template: "classic" | "modern" | "minimal"
  savedResumes: ResumeData[]
}

const defaultResume: ResumeData = {
  personal: { name: "", title: "", email: "", phone: "", location: "" },
  links: { linkedin: "", github: "", portfolio: "", website: "" },
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
}

const initialState: ResumeState = {
  data: defaultResume,
  template: "classic",
  savedResumes: [],
}

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setPersonalField(state, action: PayloadAction<{ field: keyof ResumeData["personal"]; value: string }>) {
      state.data.personal[action.payload.field] = action.payload.value
    },
    setLinkField(state, action: PayloadAction<{ field: keyof ResumeData["links"]; value: string }>) {
      state.data.links[action.payload.field] = action.payload.value
    },
    setSummary(state, action: PayloadAction<string>) {
      state.data.summary = action.payload
    },
    setSkills(state, action: PayloadAction<string[]>) {
      state.data.skills = action.payload
    },
    addSkill(state, action: PayloadAction<string>) {
      state.data.skills.push(action.payload)
    },
    removeSkill(state, action: PayloadAction<number>) {
      state.data.skills.splice(action.payload, 1)
    },
    addExperience(state, action: PayloadAction<ExperienceEntry>) {
      state.data.experience.push(action.payload)
    },
    updateExperience(state, action: PayloadAction<{ index: number; entry: ExperienceEntry }>) {
      state.data.experience[action.payload.index] = action.payload.entry
    },
    removeExperience(state, action: PayloadAction<number>) {
      state.data.experience.splice(action.payload, 1)
    },
    addEducation(state, action: PayloadAction<EducationEntry>) {
      state.data.education.push(action.payload)
    },
    updateEducation(state, action: PayloadAction<{ index: number; entry: EducationEntry }>) {
      state.data.education[action.payload.index] = action.payload.entry
    },
    removeEducation(state, action: PayloadAction<number>) {
      state.data.education.splice(action.payload, 1)
    },
    addProject(state, action: PayloadAction<ProjectEntry>) {
      state.data.projects.push(action.payload)
    },
    updateProject(state, action: PayloadAction<{ index: number; entry: ProjectEntry }>) {
      state.data.projects[action.payload.index] = action.payload.entry
    },
    removeProject(state, action: PayloadAction<number>) {
      state.data.projects.splice(action.payload, 1)
    },
    addCertification(state, action: PayloadAction<CertificationEntry>) {
      state.data.certifications.push(action.payload)
    },
    updateCertification(state, action: PayloadAction<{ index: number; entry: CertificationEntry }>) {
      state.data.certifications[action.payload.index] = action.payload.entry
    },
    removeCertification(state, action: PayloadAction<number>) {
      state.data.certifications.splice(action.payload, 1)
    },
    setTemplate(state, action: PayloadAction<"classic" | "modern" | "minimal">) {
      state.template = action.payload
    },
    setData(state, action: PayloadAction<ResumeData>) {
      state.data = action.payload
    },
    saveResume(state) {
      state.savedResumes.push(JSON.parse(JSON.stringify(state.data)))
    },
    loadResume(state, action: PayloadAction<number>) {
      const loaded = state.savedResumes[action.payload]
      if (loaded) state.data = JSON.parse(JSON.stringify(loaded))
    },
    deleteSavedResume(state, action: PayloadAction<number>) {
      state.savedResumes.splice(action.payload, 1)
    },
    resetData(state) {
      state.data = defaultResume
    },
  },
})

export const {
  setPersonalField,
  setLinkField,
  setSummary,
  setSkills,
  addSkill,
  removeSkill,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  addProject,
  updateProject,
  removeProject,
  addCertification,
  updateCertification,
  removeCertification,
  setTemplate,
  setData,
  saveResume,
  loadResume,
  deleteSavedResume,
  resetData,
} = resumeSlice.actions
export default resumeSlice.reducer
