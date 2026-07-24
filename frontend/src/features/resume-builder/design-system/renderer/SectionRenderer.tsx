"use client"
import type { SectionConfig, ResumeSections } from "@/types/resume"
import type { SectionVariantConfig } from "../templates/types"
import type { AccentPalette } from "../tokens/colors"
import { SectionHeader } from "../sections/SectionHeader"
import { ExperienceItem } from "../sections/ExperienceItem"
import { SkillGroup } from "../sections/SkillGroup"
import { EducationItem } from "../sections/EducationItem"
import { ProjectCard } from "../sections/ProjectCard"
import { CertificationItem } from "../sections/CertificationItem"
import { LanguageItem } from "../sections/LanguageItem"
import { AwardItem } from "../sections/AwardItem"
import { SummarySection } from "../sections/SummarySection"
import { Divider } from "../sections/Divider"

type SectionRendererProps = {
  sections: SectionConfig[]
  content: ResumeSections
  sectionVariants: SectionVariantConfig
  palette: AccentPalette
  textColors: { primary: string; secondary: string; muted: string }
  showDivider: boolean
  accentHeaders: boolean
  headingFont?: string
  bodyFont?: string
  headerVariant?: string
  compact?: boolean
}

const sectionTypeToTitle: Record<string, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  certifications: "Certifications",
  projects: "Projects",
  awards: "Awards & Honors",
  interests: "Interests",
  references: "References",
}

export function SectionRenderer({
  sections, content, sectionVariants, palette, textColors, showDivider, accentHeaders,
  headerVariant, compact,
}: SectionRendererProps) {
  const ordered = [...sections].filter(s => s.visible).sort((a, b) => a.order - b.order)
  const headerColors = {
    primary: accentHeaders ? palette.primary : textColors.primary,
    text: textColors.primary,
    muted: textColors.muted,
    border: palette.muted,
  }
  const isSidebar = headerVariant === "sidebar"
  const effectiveHeaderVariant = isSidebar ? "sidebar" : sectionVariants.header

  return (
    <>
      {ordered.map((section, idx) => {
        const elements: React.ReactNode[] = []

        if (section.type === "summary" && content.summary) {
          elements.push(
            <SummarySection
              key="summary"
              text={content.summary}
              variant={sectionVariants.summary as any}
              colors={{ text: textColors.primary, secondary: textColors.secondary, primary: palette.primary, muted: textColors.muted, border: palette.muted }}
              compact={compact}
            />,
          )
        }
        if (section.type === "experience") {
          elements.push(...content.experience.map(item => (
            <ExperienceItem key={item.id} item={item} variant={sectionVariants.experience as any} colors={{ primary: palette.primary, text: textColors.primary, secondary: textColors.secondary, muted: textColors.muted }} compact={compact} />
          )))
        }
        if (section.type === "education") {
          elements.push(...content.education.map(item => (
            <EducationItem key={item.id} item={item} variant={sectionVariants.education as any} colors={{ primary: palette.primary, text: textColors.primary, secondary: textColors.secondary, muted: textColors.muted }} compact={compact} />
          )))
        }
        if (section.type === "skills" && content.skills.length > 0) {
          elements.push(<SkillGroup key="skills" skills={content.skills} variant={sectionVariants.skills as any} colors={{ primary: palette.primary, text: textColors.primary, muted: textColors.muted, border: palette.muted }} />)
        }
        if (section.type === "projects") {
          elements.push(...content.projects.map(item => (
            <ProjectCard key={item.id} item={item} variant={sectionVariants.projects as any} colors={{ primary: palette.primary, text: textColors.primary, secondary: textColors.secondary, muted: textColors.muted }} compact={compact} />
          )))
        }
        if (section.type === "languages") {
          elements.push(...content.languages.map(item => (
            <LanguageItem key={item.id} item={item} colors={{ primary: palette.primary, text: textColors.primary, muted: textColors.muted }} />
          )))
        }
        if (section.type === "certifications") {
          elements.push(...content.certifications.map(item => (
            <CertificationItem key={item.id} item={item} colors={{ primary: palette.primary, text: textColors.primary, secondary: textColors.secondary, muted: textColors.muted }} />
          )))
        }
        if (section.type === "awards") {
          elements.push(...content.awards.map(item => (
            <AwardItem key={item.id} item={item} colors={{ primary: palette.primary, text: textColors.primary, muted: textColors.muted }} />
          )))
        }

        if (elements.length === 0) return null

        return (
          <div key={section.id} style={compact && idx > 0 ? { marginTop: -6 } : undefined}>
            {showDivider && idx > 0 && <Divider variant="thin" color={palette.muted} spacing={compact ? 4 : 8} />}
            <SectionHeader
              title={section.title || sectionTypeToTitle[section.type] || section.type}
              variant={effectiveHeaderVariant as any}
              colors={headerColors}
              number={effectiveHeaderVariant === "numbered" ? idx + 1 : undefined}
              compact={compact}
            />
            {elements}
          </div>
        )
      })}
    </>
  )
}
