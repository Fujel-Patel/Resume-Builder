import type { TemplateConfig } from "../types"

export const novaConfig: TemplateConfig = {
  id: "nova-timeline",
  name: "Nova Timeline",
  description: "Modern two-column layout with floating sidebar and timeline-style sections.",
  category: "two-column",
  tags: ["timeline", "modern", "two-column"],
  layout: "offset-sidebar",
  grid: "split3070",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "warmGray", text: "primary", background: "white" },
  spacing: "compact",
  contactVariant: "sidebar",
  sections: {
    header: "sidebar",
    experience: "timeline",
    skills: "tags",
    education: "compact",
    projects: "standard",
    summary: "standard",
    contact: "sidebar",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
