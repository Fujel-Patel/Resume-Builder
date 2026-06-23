import type { ResumeData, ResumeTemplate } from "../types"

export type TemplateDefinition = {
  id: ResumeTemplate
  label: string
  description: string
  tags?: string[]
  component: React.ComponentType<{ data: ResumeData }>
  preview: React.ComponentType<{ data: ResumeData }>
}

export const templateRegistry: TemplateDefinition[] = []
