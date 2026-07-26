import type { ResumeData } from "@/types/resume"
import type { TemplateConfig } from "../templates/types"
import { spacingPresets } from "../tokens/spacing"
import { pageMargins } from "../tokens/layout"

const A4_HEIGHT = 1123

const layoutOverhead: Record<string, { normal: number; compact: number }> = {
  single:             { normal: 0, compact: 0 },
  "sidebar-left":     { normal: 0, compact: 0 },
  "sidebar-right":    { normal: 0, compact: 0 },
  "two-column-left":  { normal: 0, compact: 0 },
  "two-column-right": { normal: 0, compact: 0 },
  "floating-sidebar": { normal: 0, compact: 0 },
  "hero-banner":      { normal: 116, compact: 64 },
  "executive-header": { normal: 28, compact: 18 },
  editorial:          { normal: 96, compact: 60 },
  magazine:           { normal: 116, compact: 78 },
  "split-header":     { normal: 66, compact: 48 },
  "modern-grid":      { normal: 76, compact: 54 },
  "offset-sidebar":   { normal: 80, compact: 50 },
}

const EXPERIENCE_BULLET_HEIGHT = 17

const variantItemHeight: Record<string, number> = {
  bullets: 80,
  timeline: 78,
  cards: 84,
  compact: 70,
  "role-first": 76,
  magazine: 82,
  executive: 90,
}

const educationHeight: Record<string, number> = {
  standard: 34,
  compact: 30,
  detailed: 38,
  timeline: 38,
  magazine: 42,
}

const projectHeight: Record<string, number> = {
  standard: 64,
  compact: 52,
  detailed: 68,
  card: 68,
  featured: 76,
}

const PROJECT_BULLET_HEIGHT = 16

const skillsHeight: Record<string, number> = {
  grouped: 90,
  list: 56,
  tags: 56,
  pills: 56,
  categories: 86,
  "three-column": 64,
  matrix: 76,
  progress: 86,
}

const summaryHeight: Record<string, number> = {
  standard: 38,
  highlight: 42,
  editorial: 42,
  minimal: 32,
}

const CONTACT_BLOCK_HEIGHT = 60
const SECTION_HEADER_HEIGHT = 26

export function estimateContentHeight(resume: ResumeData, config: TemplateConfig): number {
  const { sections: visibleSections } = resume
  const spacing = spacingPresets[config.spacing] ?? spacingPresets.normal
  const margin = pageMargins[config.pageMargin] ?? pageMargins.standard
  const layoutType = config.layout

  const overhead = layoutOverhead[layoutType]?.normal ?? 0
  const pageMarginHeight = (margin.top ?? 36) + (margin.bottom ?? 36)
  const isTwoColumn = layoutType.includes("sidebar") || layoutType === "floating-sidebar" || layoutType === "offset-sidebar"

  let contentHeight = CONTACT_BLOCK_HEIGHT
  const ordered = [...visibleSections].filter(s => s.visible).sort((a, b) => a.order - b.order)

  for (const section of ordered) {
    if (section.type === "contact") continue

    contentHeight += SECTION_HEADER_HEIGHT + spacing.sectionGap

    if (section.type === "summary" && resume.content.summary) {
      const variant = config.sections.summary ?? "standard"
      contentHeight += summaryHeight[variant] ?? 38
    }

    if (section.type === "experience") {
      const variant = config.sections.experience
      const perItem = variantItemHeight[variant] ?? 78
      const items = resume.content.experience
      const totalBullets = items.reduce((sum, item) => sum + item.bullets.length, 0)
      contentHeight += items.length * perItem + totalBullets * EXPERIENCE_BULLET_HEIGHT
    }

    if (section.type === "education") {
      const variant = config.sections.education
      const perItem = educationHeight[variant] ?? 34
      contentHeight += resume.content.education.length * perItem
    }

    if (section.type === "skills") {
      const variant = config.sections.skills
      const base = skillsHeight[variant] ?? 64
      const totalSkills = resume.content.skills.reduce((sum, g) => sum + g.skills.length, 0)
      const extraRows = Math.floor(totalSkills / 6) * 16
      contentHeight += base + extraRows
    }

    if (section.type === "projects") {
      const variant = config.sections.projects
      const perItem = projectHeight[variant] ?? 64
      const items = resume.content.projects
      const totalBullets = items.reduce((sum, item) => sum + item.bullets.length, 0)
      contentHeight += items.length * perItem + totalBullets * PROJECT_BULLET_HEIGHT
    }

    if (section.type === "languages") {
      contentHeight += resume.content.languages.length * 20
    }

    if (section.type === "certifications") {
      contentHeight += resume.content.certifications.length * 24
    }

    if (section.type === "awards") {
      contentHeight += resume.content.awards.length * 24
    }
  }

  const totalHeight = pageMarginHeight + overhead + contentHeight + (isTwoColumn ? 0 : 20)

  return totalHeight
}

export function shouldUseCompact(resume: ResumeData, config: TemplateConfig): boolean {
  return estimateContentHeight(resume, config) > A4_HEIGHT - 20
}
