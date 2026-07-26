import type { TemplateConfig } from "../types"

export const novaConfig: TemplateConfig = {
  id: "nova-timeline",
  name: "Nova Timeline",
  description: "Premium two-column layout with subtle timeline, clean sidebar, and modern typography.",
  category: "two-column",
  tags: ["timeline", "modern", "two-column", "ats-friendly"],
  layout: "offset-sidebar",
  grid: "split3070",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "nova", text: "primary", background: "white" },
  spacing: "nova",
  headerVariant: "classic",
  contactVariant: "compact-icons",
  sections: {
    header: "underline",
    experience: "timeline",
    skills: "grouped",
    education: "compact",
    projects: "detailed",
    summary: "standard",
    contact: "compact-icons",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
