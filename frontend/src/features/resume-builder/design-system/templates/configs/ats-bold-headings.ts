import type { TemplateConfig } from "../types"

export const atsBoldHeadingsConfig: TemplateConfig = {
  id: "ats-bold-headings",
  name: "ATS Bold Headings",
  description: "Bold section headings for visual hierarchy while staying ATS-safe.",
  category: "ats",
  tags: ["ats", "bold", "structured", "readable"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "ibmPlexSans", body: "dmSans" },
  colors: { palette: "charcoal", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "grid",
  sections: {
    header: "filled",
    experience: "bullets",
    skills: "tags",
    education: "compact",
    projects: "compact",
    summary: "highlight",
    contact: "grid",
    divider: "accent",
  },
  features: {
    showProfileImage: false,
    showIcons: false,
    showDivider: false,
    accentHeaders: true,
  },
}
