import type { TemplateConfig } from "../types"

export const atsCompactConfig: TemplateConfig = {
  id: "ats-compact",
  name: "ATS Compact",
  description: "Dense layout for fitting more content. Space-efficient ATS format.",
  category: "ats",
  tags: ["ats", "compact", "dense", "efficient"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "dmSans", body: "inter" },
  colors: { palette: "slate", text: "primary", background: "white" },
  spacing: "dense",
  headerVariant: "minimal-top",
  contactVariant: "compact-icons",
  sections: {
    header: "accent-line",
    experience: "compact",
    skills: "list",
    education: "compact",
    projects: "compact",
    summary: "minimal",
    contact: "compact-icons",
    divider: "standard",
  },
  features: {
    showProfileImage: false,
    showIcons: true,
    showDivider: true,
    accentHeaders: false,
  },
}
