import type { TemplateConfig } from "../types"

export const atsMinimalConfig: TemplateConfig = {
  id: "ats-minimal",
  name: "ATS Minimal",
  description: "Bare minimum styling for maximum parseability by ATS systems.",
  category: "ats",
  tags: ["ats", "minimal", "plain", "parseable"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "slate", text: "primary", background: "white" },
  spacing: "compact",
  headerVariant: "minimal-top",
  contactVariant: "compact-icons",
  sections: {
    header: "minimal",
    experience: "bullets",
    skills: "list",
    education: "standard",
    projects: "standard",
    summary: "minimal",
    contact: "compact-icons",
    divider: "standard",
  },
  features: {
    showProfileImage: false,
    showIcons: true,
    showDivider: false,
    accentHeaders: false,
  },
}
