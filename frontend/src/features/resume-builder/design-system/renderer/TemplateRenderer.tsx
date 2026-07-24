"use client"
import { useMemo } from "react"
import type { ResumeData } from "@/types/resume"
import type { TemplateConfig } from "../templates/types"
import { accentPalettes, textColors as defaultTextColors } from "../tokens/colors"
import { spacingPresets } from "../tokens/spacing"
import { pageMargins } from "../tokens/layout"
import { resolveFont } from "../fonts"
import { SingleColumn } from "../layouts/SingleColumn"
import { Sidebar } from "../layouts/Sidebar"
import { HeroBanner } from "../layouts/HeroBanner"
import { ExecutiveHeader } from "../layouts/ExecutiveHeader"
import { EditorialLayout } from "../layouts/EditorialLayout"
import { MagazineLayout } from "../layouts/MagazineLayout"
import { FloatingSidebar } from "../layouts/FloatingSidebar"
import { SplitHeaderLayout } from "../layouts/SplitHeaderLayout"
import { ModernGrid } from "../layouts/ModernGrid"
import { OffsetSidebar } from "../layouts/OffsetSidebar"
import { ProfileImage } from "../sections/ProfileImage"
import { ContactInfo } from "../sections/ContactInfo"
import { SectionRenderer } from "./SectionRenderer"
import { shouldUseCompact } from "./estimateHeight"
import type { ReactNode } from "react"

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
  const spacing = spacingPresets[config.spacing] ?? spacingPresets.normal
  const margin = pageMargins[config.pageMargin] ?? pageMargins.standard
  const bodyFont = resolveFont(config.fonts.body)
  const headingFont = resolveFont(config.fonts.heading)

  const hv = config.headerVariant ?? "classic"
  const cv = config.contactVariant ?? config.sections.contact

  const isCompact = shouldUseCompact(resume, config)

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
    headerVariant: hv,
    compact: isCompact,
  }

  const contactSection = visibleSections.find(s => s.type === "contact")
  const nonContactSections = visibleSections.filter(s => s.type !== "contact")

  const contactBlock = contactSection ? renderContactBlock(hv, cv, config, content, palette, text, textSecondary, textMuted, headingFont, spacing) : null

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

  const allSectionsContent = (
    <SectionRenderer {...sectionRendererProps} sections={nonContactSections} />
  )

  // --- Existing layouts ---

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
        gap={24}
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
        gap={24}
        margin={margin}
        sidebarBg={palette.light}
      />
    )
  }

  // --- New layouts ---

  if (config.layout === "hero-banner") {
    const header = (
      <div style={{ fontFamily: headingFont }}>
        {config.features.showProfileImage && content.contact.photoUrl && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <ProfileImage
              photoUrl={content.contact.photoUrl}
              fullName={content.contact.fullName}
              size={72}
              bgColor={palette.text}
              textColor={palette.primary}
            />
          </div>
        )}
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em", textAlign: "center" as const, color: palette.text }}>
          {content.contact.fullName || "Your Name"}
        </h1>
        {content.contact.title && (
          <p style={{ fontSize: 14, fontWeight: 400, margin: "6px 0 0", lineHeight: 1.3, textAlign: "center" as const, opacity: 0.85, color: palette.text }}>
            {content.contact.title}
          </p>
        )}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
          <ContactInfo
            contact={content.contact}
            variant={cv as any}
            colors={{ primary: palette.text, text: palette.text, secondary: palette.text + "cc", muted: palette.text + "aa" }}
            showIcons={config.features.showIcons}
          />
        </div>
      </div>
    )
    return (
      <HeroBanner header={header} headerBg={palette.primary} headerTextColor={palette.text} margin={margin} padding={margin.right} compact={isCompact}>
        <div style={{ fontFamily: bodyFont }}>{allSectionsContent}</div>
      </HeroBanner>
    )
  }

  if (config.layout === "executive-header") {
    const header = (
      <div style={{ fontFamily: headingFont, display: "flex", alignItems: "center", gap: 16 }}>
        {config.features.showProfileImage && content.contact.photoUrl && (
          <ProfileImage
            photoUrl={content.contact.photoUrl}
            fullName={content.contact.fullName}
            size={68}
            bgColor={palette.primary}
            textColor={palette.text}
          />
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: palette.primary, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            {content.contact.fullName || "Your Name"}
          </h1>
          {content.contact.title && (
            <p style={{ fontSize: 14, fontWeight: 500, color: palette.primary + "99", margin: "4px 0 0", lineHeight: 1.3 }}>
              {content.contact.title}
            </p>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          <ContactInfo
            contact={content.contact}
            variant={cv as any}
            colors={{ primary: palette.primary, text, secondary: textSecondary, muted: textMuted }}
            showIcons={config.features.showIcons}
          />
        </div>
      </div>
    )
    return (
      <ExecutiveHeader header={header} accentColor={palette.primary} margin={margin} compact={isCompact}>
        <div style={{ fontFamily: bodyFont }}>{allSectionsContent}</div>
      </ExecutiveHeader>
    )
  }

  if (config.layout === "editorial") {
    return (
      <EditorialLayout margin={margin} accentColor={palette.primary} compact={isCompact}>
        <div style={{ fontFamily: bodyFont }}>
          {contactBlock}
          {allSectionsContent}
        </div>
      </EditorialLayout>
    )
  }

  if (config.layout === "magazine") {
    const hero = (
      <div style={{ fontFamily: headingFont }}>
        {config.features.showProfileImage && content.contact.photoUrl && (
          <div style={{ marginBottom: 10 }}>
            <ProfileImage
              photoUrl={content.contact.photoUrl}
              fullName={content.contact.fullName}
              size={72}
              bgColor={palette.primary}
              textColor={palette.text}
            />
          </div>
        )}
        <h1 style={{ fontSize: 30, fontWeight: 700, color: text, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {content.contact.fullName || "Your Name"}
        </h1>
        {content.contact.title && (
          <p style={{ fontSize: 14, fontWeight: 400, color: palette.primary, margin: "5px 0 0", lineHeight: 1.3 }}>
            {content.contact.title}
          </p>
        )}
        <div style={{ marginTop: 10 }}>
          <ContactInfo
            contact={content.contact}
            variant={cv as any}
            colors={{ primary: palette.primary, text, secondary: textSecondary, muted: textMuted }}
            showIcons={config.features.showIcons}
          />
        </div>
      </div>
    )
    return (
      <MagazineLayout hero={hero} accentColor={palette.primary} margin={margin} compact={isCompact}>
        <div style={{ fontFamily: bodyFont }}>{allSectionsContent}</div>
      </MagazineLayout>
    )
  }

  if (config.layout === "floating-sidebar") {
    const sidebarWidth = config.grid === "narrowSidebar" ? 22 : config.grid === "split3070" ? 30 : 28
    return (
      <FloatingSidebar
        sidebar={sidebarContent}
        main={mainContent}
        sidebarWidth={sidebarWidth}
        sidebarPosition="left"
        gap={24}
        sidebarBg={palette.light}
        margin={margin}
      />
    )
  }

  if (config.layout === "split-header") {
    const left = (
      <div style={{ fontFamily: headingFont }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: text, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {content.contact.fullName || "Your Name"}
        </h1>
        {content.contact.title && (
          <p style={{ fontSize: 13, fontWeight: 400, color: palette.primary, margin: "4px 0 0", lineHeight: 1.3 }}>
            {content.contact.title}
          </p>
        )}
      </div>
    )
    const right = (
      <div style={{ fontFamily: bodyFont }}>
        <ContactInfo
          contact={content.contact}
          variant={cv as any}
          colors={{ primary: palette.primary, text, secondary: textSecondary, muted: textMuted }}
          showIcons={config.features.showIcons}
        />
      </div>
    )
    return (
      <SplitHeaderLayout left={left} right={right} accentColor={palette.primary} margin={margin} compact={isCompact}>
        <div style={{ fontFamily: bodyFont }}>{allSectionsContent}</div>
      </SplitHeaderLayout>
    )
  }

  if (config.layout === "modern-grid") {
    const header = (
      <div style={{ fontFamily: headingFont }}>
        {config.features.showProfileImage && content.contact.photoUrl && (
          <div style={{ marginBottom: 8 }}>
            <ProfileImage
              photoUrl={content.contact.photoUrl}
              fullName={content.contact.fullName}
              size={56}
              bgColor={palette.primary}
              textColor={palette.text}
            />
          </div>
        )}
        <h1 style={{ fontSize: 28, fontWeight: 700, color: text, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {content.contact.fullName || "Your Name"}
        </h1>
        {content.contact.title && (
          <p style={{ fontSize: 13, fontWeight: 400, color: palette.primary, margin: "4px 0 0", lineHeight: 1.3 }}>
            {content.contact.title}
          </p>
        )}
        <div style={{ marginTop: 8 }}>
          <ContactInfo
            contact={content.contact}
            variant={cv as any}
            colors={{ primary: palette.primary, text, secondary: textSecondary, muted: textMuted }}
            showIcons={config.features.showIcons}
          />
        </div>
      </div>
    )
    const leftSections = nonContactSections.filter((_, i) => i % 2 === 0)
    const rightSections = nonContactSections.filter((_, i) => i % 2 === 1)
    return (
      <ModernGrid header={header} accentColor={palette.primary} margin={margin} compact={isCompact}>
        <div style={{ fontFamily: bodyFont }}>
          <SectionRenderer {...sectionRendererProps} sections={leftSections} />
        </div>
        <div style={{ fontFamily: bodyFont }}>
          <SectionRenderer {...sectionRendererProps} sections={rightSections} />
        </div>
      </ModernGrid>
    )
  }

  if (config.layout === "offset-sidebar") {
    const topBar = (
      <div style={{ fontFamily: headingFont }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: text, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {content.contact.fullName || "Your Name"}
        </h1>
        {content.contact.title && (
          <p style={{ fontSize: 13, fontWeight: 400, color: palette.primary, margin: "4px 0 0", lineHeight: 1.3 }}>
            {content.contact.title}
          </p>
        )}
      </div>
    )
    return (
      <OffsetSidebar
        topBar={topBar}
        sidebar={sidebarContent}
        main={mainContent}
        sidebarWidth={config.grid === "narrowSidebar" ? 22 : config.grid === "split3070" ? 30 : 28}
        sidebarBg={palette.light}
        margin={margin}
        compact={isCompact}
      />
    )
  }

  // Fallback
  return (
    <SingleColumn margin={margin}>
      <div style={{ fontFamily: bodyFont }}>
        {contactBlock}
        {mainContent}
      </div>
    </SingleColumn>
  )
}

function renderContactBlock(
  hv: string,
  cv: string,
  config: TemplateConfig,
  content: ResumeData["content"],
  palette: (typeof accentPalettes)[string],
  text: string,
  textSecondary: string,
  textMuted: string,
  headingFont: string,
  spacing: { sectionGap: number; itemGap: number; intraGap: number },
) {
  const photo = config.features.showProfileImage ? (
    <ProfileImage
      photoUrl={content.contact.photoUrl}
      fullName={content.contact.fullName}
      size={60}
      bgColor={palette.primary}
      textColor={palette.text}
    />
  ) : null

  const nameTitle = (
    <div>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: text, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: headingFont }}>
        {content.contact.fullName || "Your Name"}
      </h1>
      {content.contact.title && (
        <p style={{ fontSize: 13, fontWeight: 400, color: palette.primary, margin: "3px 0 0", lineHeight: 1.3, letterSpacing: "0.01em" }}>
          {content.contact.title}
        </p>
      )}
    </div>
  )

  const contactInfo = (
    <ContactInfo
      contact={content.contact}
      variant={cv as any}
      colors={{ primary: palette.primary, text, secondary: textSecondary, muted: textMuted }}
      showIcons={config.features.showIcons}
    />
  )

  if (hv === "centered") {
    return (
      <div style={{ marginBottom: spacing.sectionGap, textAlign: "center" as const }}>
        {photo && <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>{photo}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 0.75, backgroundColor: palette.muted }} />
          <h1 style={{ fontSize: 30, fontWeight: 700, color: text, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: headingFont, whiteSpace: "nowrap" as const }}>
            {content.contact.fullName || "Your Name"}
          </h1>
          <div style={{ flex: 1, height: 0.75, backgroundColor: palette.muted }} />
        </div>
        {content.contact.title && (
          <p style={{ fontSize: 13, fontWeight: 400, color: palette.primary, margin: "0 0 8px", lineHeight: 1.3, letterSpacing: "0.01em" }}>
            {content.contact.title}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center" }}>{contactInfo}</div>
      </div>
    )
  }

  if (hv === "banner") {
    return (
      <div style={{ marginBottom: spacing.sectionGap, backgroundColor: palette.primary, margin: "0 0 " + spacing.sectionGap + "px", padding: "18px 24px", borderRadius: 3 }}>
        {photo && <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{photo}</div>}
        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: headingFont, textAlign: "center" as const }}>
          {content.contact.fullName || "Your Name"}
        </h1>
        {content.contact.title && (
          <p style={{ fontSize: 13, fontWeight: 400, color: "#ffffffcc", margin: "4px 0 0", lineHeight: 1.3, textAlign: "center" as const }}>
            {content.contact.title}
          </p>
        )}
        <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
          <ContactInfo
            contact={content.contact}
            variant={cv as any}
            colors={{ primary: "#ffffff", text: "#ffffff", secondary: "#ffffffdd", muted: "#ffffffaa" }}
            showIcons={config.features.showIcons}
          />
        </div>
      </div>
    )
  }

  if (hv === "split") {
    return (
      <div style={{ marginBottom: spacing.sectionGap, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {photo}
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: text, margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: headingFont }}>
              {content.contact.fullName || "Your Name"}
            </h1>
            {content.contact.title && (
              <p style={{ fontSize: 13, fontWeight: 400, color: palette.primary, margin: "3px 0 0", lineHeight: 1.3 }}>
                {content.contact.title}
              </p>
            )}
          </div>
        </div>
        <div style={{ flexShrink: 0, paddingTop: 4 }}>
          {contactInfo}
        </div>
      </div>
    )
  }

  if (hv === "minimal-top") {
    return (
      <div style={{ marginBottom: spacing.sectionGap }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, paddingBottom: 6, borderBottom: `1px solid ${palette.muted}` }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: text, margin: 0, lineHeight: 1.15, letterSpacing: "-0.01em", fontFamily: headingFont }}>
            {content.contact.fullName || "Your Name"}
          </h1>
          {content.contact.title && (
            <span style={{ fontSize: 11, color: palette.primary, fontWeight: 500 }}>
              {content.contact.title}
            </span>
          )}
          <div style={{ flex: 1 }} />
          {contactInfo}
        </div>
      </div>
    )
  }

  // classic (default)
  return (
    <div style={{ marginBottom: spacing.sectionGap }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: spacing.itemGap }}>
        {photo}
        {nameTitle}
      </div>
      {contactInfo}
    </div>
  )
}
