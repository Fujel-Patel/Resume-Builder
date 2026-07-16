import type { TemplateConfig } from "../types"

export const professionalExecutiveConfig: TemplateConfig = {
  id: "professional-executive",
  name: "Professional Executive",
  description: "Corporate navy single-sectionHeader with dividers. Clean, authoritative, ATS-friendly.",
  category: "professional",
  tags: ["corporate", "executive", "finance", "consulting", "ats-safe"],
  layout: "single",
  grid: "single",
  pageMargin: "wide",
  fonts: {
    heading: "inter",
    body: "inter",
  },
  colors: {
    palette: "navy",
    text: "primary",
    background: "white",
  },
  spacing: "spacious",
  sections: {
    header: "divider",
    experience: "standard",
    skills: "compact",
    education: "standard",
    projects: "standard",
    contact: "inline",
    divider: "standard",
  },
  features: {
    showProfileImage: true,
    showIcons: true,
    showDivider: true,
    accentHeaders: true,
  },
}
