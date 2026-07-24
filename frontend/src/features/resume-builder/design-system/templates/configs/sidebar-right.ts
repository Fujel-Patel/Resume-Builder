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
  fonts: { heading: "dmSans", body: "inter" },
  colors: { palette: "ocean", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "grid",
  sections: {
    header: "accent-line",
    experience: "compact",
    skills: "tags",
    education: "compact",
    projects: "compact",
    summary: "highlight",
    contact: "grid",
    divider: "accent",
  },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
