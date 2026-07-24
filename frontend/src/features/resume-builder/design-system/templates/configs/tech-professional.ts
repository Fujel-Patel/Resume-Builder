import type { TemplateConfig } from "../types"

export const techProfessionalConfig: TemplateConfig = {
  id: "tech-professional",
  name: "Tech Professional",
  description: "Modern tech industry template. Monospace accents for developers.",
  category: "professional",
  tags: ["tech", "developer", "engineering", "modern"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "geist", body: "dmSans" },
  colors: { palette: "indigo", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "banner",
  contactVariant: "chips",
  sections: {
    header: "border",
    experience: "cards",
    skills: "tags",
    education: "detailed",
    projects: "standard",
    summary: "highlight",
    contact: "chips",
    divider: "accent",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
