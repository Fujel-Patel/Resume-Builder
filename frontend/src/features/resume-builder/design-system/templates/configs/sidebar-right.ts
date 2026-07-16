import type { TemplateConfig } from "../types"

export const sidebarRightConfig: TemplateConfig = {
  id: "sidebar-right",
  name: "Sidebar Right",
  description: "Right sidebar layout. Experience takes center stage.",
  category: "two-column",
  tags: ["sidebar", "right", "experience-first", "modern"],
  layout: "sidebar-right",
  grid: "sidebarRight",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "indigo", text: "primary", background: "white" },
  spacing: "compact",
  sections: { header: "underline-accent", experience: "compact", skills: "compact", education: "compact", projects: "compact", contact: "inline", divider: "accent" },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
