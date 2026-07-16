import type { TemplateConfig } from "../types"

export const novaConfig: TemplateConfig = {
  id: "nova",
  name: "Nova",
  description: "Two-column sidebar with timeline dots. Modern, structured, information-dense.",
  category: "two-column",
  tags: ["timeline", "sidebar", "modern", "dense"],
  layout: "sidebar-left",
  grid: "narrowSidebar",
  pageMargin: "narrow",
  fonts: {
    heading: "inter",
    body: "inter",
  },
  colors: {
    palette: "slate",
    text: "primary",
    background: "white",
  },
  spacing: "compact",
  sections: {
    header: "underline",
    experience: "compact",
    skills: "compact",
    education: "compact",
    projects: "compact",
    contact: "inline",
    divider: "thin",
  },
  features: {
    showProfileImage: true,
    showIcons: false,
    showDivider: false,
    accentHeaders: false,
  },
}
