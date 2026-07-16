import type { TemplateConfig } from "../types"

export const techProfessionalConfig: TemplateConfig = {
  id: "tech-professional",
  name: "Tech Professional",
  description: "Modern tech industry template. Monospace accents for developers.",
  category: "professional",
  tags: ["tech", "developer", "engineering", "modern"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "ibmPlexSans", body: "inter", mono: "jetBrainsMono" },
  colors: { palette: "indigo", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "underline-accent", experience: "standard", skills: "compact", education: "standard", projects: "detailed", contact: "inline", divider: "accent" },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
