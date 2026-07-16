"use client"
import { useMemo } from "react"
import type { ResumeData } from "@/types/resume"
import type { TemplateConfig } from "../templates/types"
import { accentPalettes, textColors as defaultTextColors, bgColors } from "../tokens/colors"
import { spacingPresets } from "../tokens/spacing"
import { pageMargins } from "../tokens/layout"
import { resolveFont } from "../fonts"
import { SingleColumn } from "../layouts/SingleColumn"
import { TwoColumn } from "../layouts/TwoColumn"
import { Sidebar } from "../layouts/Sidebar"
import { ProfileImage } from "../sections/ProfileImage"
import { ContactInfo } from "../sections/ContactInfo"
import { SectionRenderer } from "./SectionRenderer"

type ConfigTemplateRendererProps = {
  config: TemplateConfig
  resume: ResumeData
}

export function ConfigTemplateRenderer({ config, resume }: ConfigTemplateRendererProps) {
  const { content, sections } = resume
  const palette = accentPalettes[config.colors.palette] ?? accentPalettes.navy
  const text = defaultTextColors[config.colors.text] ?? defaultTextColors.primary
  const textSecondary = defaultTextColors.secondary
  const textMuted = defaultTextColors.muted
  const bg = bgColors[config.colors.background] ?? bgColors.white
  const spacing = spacingPresets[config.spacing] ?? spacingPresets.normal
  const margin = pageMargins[config.pageMargin] ?? pageMargins.standard
  const bodyFont = resolveFont(config.fonts.body)
  const headingFont = resolveFont(config.fonts.heading)

  const visibleSections = useMemo(
    () => [...sections].filter(s => s.visible).sort((a, b) => a.order - b.order),
    [sections],
  )

  const sectionRendererProps = {
    sections: visibleSections,
    content,
    sectionVariants: config.sections,
    palette,
    textColors: { primary: text, secondary: textSecondary, muted: textMuted },
    showDivider: config.features.showDivider,
    accentHeaders: config.features.accentHeaders,
    headingFont,
    bodyFont,
  }

  const contactSection = visibleSections.find(s => s.type === "contact")
  const nonContactSections = visibleSections.filter(s => s.type !== "contact")

  const contactBlock = contactSection ? (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: spacing.itemGap }}>
        {config.features.showProfileImage && (
          <ProfileImage
            photoUrl={content.contact.photoUrl}
            fullName={content.contact.fullName}
            size={56}
            bgColor={palette.primary}
            textColor={palette.text}
          />
        )}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: text, margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em", fontFamily: headingFont }}>
            {content.contact.fullName || "Your Name"}
          </h1>
          {content.contact.title && (
            <p style={{ fontSize: 14, fontWeight: 400, color: textSecondary, margin: "2px 0 0", lineHeight: 1.3 }}>
              {content.contact.title}
            </p>
          )}
        </div>
      </div>
      <ContactInfo
        contact={content.contact}
        variant="inline"
        colors={{ primary: palette.primary, text, secondary: textSecondary, muted: textMuted }}
        showIcons={config.features.showIcons}
      />
    </div>
  ) : null

  const mainContent = (
    <SectionRenderer {...sectionRendererProps} sections={nonContactSections} />
  )

  const sidebarContent = (
    <SectionRenderer
      {...sectionRendererProps}
      sections={visibleSections.filter(s =>
        ["skills", "languages", "certifications", "contact"].includes(s.type)
      )}
    />
  )

  if (config.layout === "single") {
    return (
      <SingleColumn margin={margin}>
        <div style={{ fontFamily: bodyFont }}>
          {contactBlock}
          {mainContent}
        </div>
      </SingleColumn>
    )
  }

  if (config.layout === "sidebar-left" || config.layout === "two-column-left") {
    return (
      <Sidebar
        sidebar={sidebarContent}
        main={mainContent}
        sidebarWidth={config.grid === "narrowSidebar" ? 22 : config.grid === "split3070" ? 30 : 28}
        sidebarPosition="left"
        gap={20}
        margin={margin}
        sidebarBg={palette.light}
      />
    )
  }

  if (config.layout === "sidebar-right" || config.layout === "two-column-right") {
    return (
      <Sidebar
        sidebar={sidebarContent}
        main={mainContent}
        sidebarWidth={28}
        sidebarPosition="right"
        gap={20}
        margin={margin}
        sidebarBg={palette.light}
      />
    )
  }

  // timeline fallback — treat as single column
  return (
    <SingleColumn margin={margin}>
      <div style={{ fontFamily: bodyFont }}>
        {contactBlock}
        {mainContent}
      </div>
    </SingleColumn>
  )
}
