import type { TemplateConfig } from "../types"

export const atsExecutiveConfig: TemplateConfig = {
  id: "ats-executive",
  name: "ATS Executive",
  description: "Formal executive-level ATS template. Navy and charcoal tones.",
  category: "ats",
  tags: ["ats", "executive", "formal", "corporate"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "executive",
  headerVariant: "split",
  contactVariant: "right-aligned",
  sections: {
    header: "editorial",
    experience: "role-first",
    skills: "grouped",
    education: "detailed",
    projects: "standard",
    summary: "editorial",
    contact: "right-aligned",
    divider: "standard",
  },
  features: {
    showProfileImage: false,
    showIcons: false,
    showDivider: false,
    accentHeaders: true,
  },
}
