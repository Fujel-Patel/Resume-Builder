import type { TemplateConfig } from "../types"

export const sidebarClassicConfig: TemplateConfig = {
  id: "sidebar-classic",
  name: "Sidebar Classic",
  description: "Classic left sidebar with skills and contact. Main area for experience.",
  category: "two-column",
  tags: ["sidebar", "classic", "two-column", "balanced"],
  layout: "sidebar-left",
  grid: "sidebarLeft",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "compact",
  sections: { header: "underline", experience: "compact", skills: "compact", education: "compact", projects: "compact", contact: "inline", divider: "thin" },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
