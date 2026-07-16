import type { TemplateConfig } from "../types"

export const atsModernSansConfig: TemplateConfig = {
  id: "ats-modern-sans",
  name: "ATS Modern Sans",
  description: "Modern sans-serif with clean lines. Tech-friendly ATS format.",
  category: "ats",
  tags: ["ats", "modern", "tech", "sans-serif"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "ibmPlexSans", body: "inter" },
  colors: { palette: "indigo", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "underline-accent", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "accent" },
  features: { showProfileImage: false, showIcons: false, showDivider: false, accentHeaders: true },
}
