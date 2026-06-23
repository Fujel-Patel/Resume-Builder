import type { ComponentType } from "react"
import type { ResumeData } from "@/types/resume"
import { NovaTemplate } from "./nova-template"
import { ProfessionalExecutiveTemplate } from "./professional-executive"
import { ObsidianEdgeTemplate } from "./obsidian-edge"
import { BlueSteelTemplate } from "./blue-steel"
import { NeonGreenTemplate } from "./neon-green"

export type BuilderTemplateComponent = ComponentType<{ resume: ResumeData }>

export type BuilderTemplateEntry = {
  id: string
  name: string
  description: string
  tags: string[]
  component: BuilderTemplateComponent
}

export const builderTemplates: BuilderTemplateEntry[] = [
  {
    id: "nova-timeline",
    name: "Nova Timeline",
    description: "Modern two-column timeline layout with sidebar",
    tags: ["ATS Friendly", "Modern"],
    component: NovaTemplate,
  },
  {
    id: "professional-executive",
    name: "Professional Executive",
    description: "Corporate navy design with structured sections",
    tags: ["Executive", "ATS Friendly"],
    component: ProfessionalExecutiveTemplate,
  },
  {
    id: "obsidian-edge",
    name: "Obsidian Edge",
    description: "Modern executive template with bold black header",
    tags: ["Modern", "ATS Friendly", "Professional"],
    component: ObsidianEdgeTemplate,
  },
  {
    id: "blue-steel",
    name: "Blue Steel",
    description: "Minimalist European design with elegant typography and card-based layout",
    tags: ["Executive", "ATS Friendly", "Professional"],
    component: BlueSteelTemplate,
  },
  {
    id: "neon-green",
    name: "Neon Green",
    description: "Modern software-engineer resume with clean typography and subtle green accents",
    tags: ["ATS Friendly", "Modern", "Professional"],
    component: NeonGreenTemplate,
  },
]

export const templateMap: Record<string, BuilderTemplateComponent> = Object.fromEntries(
  builderTemplates.map((t) => [t.id, t.component])
)
