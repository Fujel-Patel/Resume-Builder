import type { FontFamily, TypeScaleToken } from "../tokens/typography"
import type { AccentName, TextColorName, BgColorName } from "../tokens/colors"
import type { SpacingPreset } from "../tokens/spacing"
import type { MarginPreset, GridSystem } from "../tokens/layout"
import type { ResumeData } from "@/types/resume"
import type { ComponentType } from "react"

export type HeaderVariant =
  | "underline"       // classic left-aligned with bottom border
  | "accent-line"     // left border accent
  | "border"          // boxed inline border
  | "filled"          // solid background pill
  | "minimal"         // subtle small caps
  | "two-tone"        // title + horizontal rule
  | "icon-left"       // icon + title
  | "sidebar"         // sidebar style (small, underlined)
  | "editorial"       // large decorative with thick accent
  | "centered"        // centered with decorative lines on sides
  | "numbered"        // section number + title

export type ContactVariant =
  | "inline"           // bullet-separated single line
  | "grid"             // 2-column grid
  | "sidebar"          // vertical stack with dots
  | "chips"            // compact rounded pills
  | "right-aligned"    // right-aligned inline
  | "compact-icons"    // small icons + text
  | "two-rows"         // two balanced rows

export type SummaryVariant =
  | "standard"         // plain paragraph
  | "highlight"        // subtle background + border
  | "editorial"        // larger text with decorative quote
  | "minimal"          // small muted text

export type SkillsVariant =
  | "list"             // comma-separated inline
  | "grouped"          // name: skills grid
  | "tags"             // bordered tag chips
  | "pills"            // colored pill badges
  | "categories"       // uppercase category labels
  | "three-column"     // 3-column compact grid
  | "matrix"           // dense grid with separators
  | "progress"         // name + dot rating

export type ExperienceVariant =
  | "bullets"          // standard role/company/bullets
  | "timeline"         // with timeline dots
  | "cards"            // bordered card per item
  | "compact"          // dense single-line
  | "role-first"       // role prominent, company secondary
  | "magazine"         // editorial bold layout
  | "executive"        // large role, prominent dates

export type EducationVariant =
  | "standard"         // institution + degree
  | "compact"          // dense single-line
  | "detailed"         // institution first, degree below
  | "timeline"         // with decorative element
  | "magazine"         // bold institution, thin degree

export type ProjectVariant =
  | "standard"         // name + role + bullets
  | "compact"          // dense with joined bullets
  | "detailed"         // with border-left accent
  | "card"             // bordered card
  | "featured"         // prominent with background

export type SectionVariantConfig = {
  header: HeaderVariant | string
  experience: ExperienceVariant | string
  skills: SkillsVariant | string
  education: EducationVariant | string
  projects: ProjectVariant | string
  contact: ContactVariant | string
  divider: string
  summary?: SummaryVariant | string
  certifications?: string
  languages?: string
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
  layout: "single" | "two-column-left" | "two-column-right" | "sidebar-left" | "sidebar-right" | "timeline" | "hero-banner" | "executive-header" | "editorial" | "magazine" | "floating-sidebar" | "split-header" | "modern-grid" | "offset-sidebar"
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
  /** Controls the contact/header block rendering style */
  headerVariant?: "classic" | "centered" | "banner" | "split" | "minimal-top"
  /** Controls the contact info display style (overrides sections.contact for header block) */
  contactVariant?: ContactVariant
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
