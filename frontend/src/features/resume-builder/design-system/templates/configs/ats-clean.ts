import type { TemplateConfig } from "../types"

export const atsCleanConfig: TemplateConfig = {
  id: "ats-clean",
  name: "ATS Clean",
  description: "Ultra-clean, max ATS compatibility. No graphics, pure text.",
  category: "ats",
  tags: ["ats", "clean", "simple", "minimal"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "slate", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "inline",
  sections: {
    header: "underline",
    experience: "bullets",
    skills: "list",
    education: "standard",
    projects: "standard",
    summary: "standard",
    contact: "inline",
    divider: "standard",
  },
  features: {
    showProfileImage: false,
    showIcons: false,
    showDivider: false,
    accentHeaders: false,
  },
}
