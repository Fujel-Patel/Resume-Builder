import type { TemplateConfig } from "../types"

export const sidebarModernConfig: TemplateConfig = {
  id: "sidebar-modern",
  name: "Sidebar Modern",
  description: "Modern left sidebar with teal accents. Clean, contemporary design.",
  category: "two-column",
  tags: ["sidebar", "modern", "teal", "contemporary"],
  layout: "sidebar-left",
  grid: "sidebarLeft",
  pageMargin: "narrow",
  fonts: { heading: "geist", body: "dmSans" },
  colors: { palette: "steel", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "chips",
  sections: {
    header: "accent-line",
    experience: "compact",
    skills: "pills",
    education: "compact",
    projects: "compact",
    summary: "standard",
    contact: "chips",
    divider: "accent",
  },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
