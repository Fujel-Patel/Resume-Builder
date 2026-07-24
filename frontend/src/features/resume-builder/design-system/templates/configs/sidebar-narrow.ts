import type { TemplateConfig } from "../types"

export const sidebarNarrowConfig: TemplateConfig = {
  id: "sidebar-narrow",
  name: "Sidebar Narrow",
  description: "Narrow left sidebar for contact/skills. Maximum space for experience.",
  category: "two-column",
  tags: ["sidebar", "narrow", "experience-focused", "efficient"],
  layout: "sidebar-left",
  grid: "narrowSidebar",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "slate", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "compact-icons",
  sections: {
    header: "two-tone",
    experience: "bullets",
    skills: "grouped",
    education: "standard",
    projects: "standard",
    summary: "standard",
    contact: "compact-icons",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: false },
}
