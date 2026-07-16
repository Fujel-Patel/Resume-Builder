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
  fonts: { heading: "dmSans", body: "inter" },
  colors: { palette: "teal", text: "primary", background: "white" },
  spacing: "compact",
  sections: { header: "underline-accent", experience: "compact", skills: "compact", education: "compact", projects: "compact", contact: "inline", divider: "accent" },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
