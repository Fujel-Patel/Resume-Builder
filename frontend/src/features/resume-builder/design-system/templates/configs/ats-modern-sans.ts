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
  fonts: { heading: "geist", body: "dmSans" },
  colors: { palette: "indigo", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "centered",
  contactVariant: "right-aligned",
  sections: {
    header: "centered",
    experience: "bullets",
    skills: "grouped",
    education: "standard",
    projects: "standard",
    summary: "standard",
    contact: "right-aligned",
    divider: "accent",
  },
  features: {
    showProfileImage: false,
    showIcons: false,
    showDivider: true,
    accentHeaders: true,
  },
}
