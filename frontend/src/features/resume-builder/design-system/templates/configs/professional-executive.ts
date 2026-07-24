import type { TemplateConfig } from "../types"

export const professionalExecutiveConfig: TemplateConfig = {
  id: "professional-executive",
  name: "Professional Executive",
  description: "Corporate navy with executive header block and structured sections.",
  category: "professional",
  tags: ["executive", "ats-friendly", "corporate", "navy"],
  layout: "executive-header",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "normal",
  contactVariant: "right-aligned",
  sections: {
    header: "underline",
    experience: "bullets",
    skills: "grouped",
    education: "standard",
    projects: "card",
    summary: "standard",
    contact: "right-aligned",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
