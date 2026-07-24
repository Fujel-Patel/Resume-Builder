import type { TemplateConfig } from "../types"

export const atsSerifConfig: TemplateConfig = {
  id: "ats-serif",
  name: "ATS Serif",
  description: "Traditional serif headings for formal industries like law and finance.",
  category: "ats",
  tags: ["ats", "serif", "traditional", "formal"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "two-rows",
  sections: {
    header: "two-tone",
    experience: "role-first",
    skills: "grouped",
    education: "detailed",
    projects: "standard",
    summary: "editorial",
    contact: "two-rows",
    divider: "standard",
  },
  features: {
    showProfileImage: false,
    showIcons: false,
    showDivider: true,
    accentHeaders: true,
  },
}
