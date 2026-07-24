import type { TemplateConfig } from "../types"

export const legalConfig: TemplateConfig = {
  id: "legal",
  name: "Legal",
  description: "Formal legal template with serif fonts. Court-ready, authoritative.",
  category: "professional",
  tags: ["legal", "law", "attorney", "formal"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "minimal-top",
  contactVariant: "compact-icons",
  sections: {
    header: "underline",
    experience: "role-first",
    education: "detailed",
    skills: "grouped",
    projects: "standard",
    summary: "editorial",
    contact: "compact-icons",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: true, accentHeaders: true },
}
