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
  colors: { palette: "steel", text: "primary", background: "white" },
  spacing: "compact",
  sections: { header: "standard", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: false },
}
