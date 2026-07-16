import type { FontFamily, TypeScaleToken } from "../tokens/typography"
import type { AccentName, TextColorName, BgColorName } from "../tokens/colors"
import type { SpacingPreset } from "../tokens/spacing"
import type { MarginPreset, GridSystem } from "../tokens/layout"
import type { ResumeData } from "@/types/resume"
import type { ComponentType } from "react"

export type SectionVariantConfig = {
  header: string
  experience: string
  skills: string
  education: string
  projects: string
  contact: string
  divider: string
}

export type TemplateFeatures = {
  showProfileImage: boolean
  showIcons: boolean
  showDivider: boolean
  accentHeaders: boolean
}

export type TemplateConfig = {
  id: string
  name: string
  description: string
  category: "ats" | "professional" | "two-column" | "timeline" | "creative"
  tags: string[]
  layout: "single" | "two-column-left" | "two-column-right" | "sidebar-left" | "sidebar-right" | "timeline"
  grid: GridSystem
  pageMargin: MarginPreset
  fonts: {
    heading: FontFamily
    body: FontFamily
    mono?: FontFamily
  }
  colors: {
    palette: AccentName
    text: TextColorName
    background: BgColorName
  }
  spacing: SpacingPreset
  sections: SectionVariantConfig
  features: TemplateFeatures
}

export type BuilderTemplateComponent = ComponentType<{ resume: ResumeData }>

export type TemplateEntry =
  | { type: "config"; config: TemplateConfig }
  | { type: "component"; component: BuilderTemplateComponent; metadata: TemplateMetadata }

export type TemplateMetadata = {
  id: string
  name: string
  description: string
  tags: string[]
  category: TemplateConfig["category"]
}
