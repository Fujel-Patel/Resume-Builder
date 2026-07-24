import type { TemplateConfig } from "../types"

export const sidebarDarkConfig: TemplateConfig = {
  id: "sidebar-dark",
  name: "Sidebar Dark",
  description: "Dark charcoal sidebar with light main area. Bold, distinctive contrast.",
  category: "two-column",
  tags: ["sidebar", "dark", "contrast", "bold"],
  layout: "sidebar-left",
  grid: "sidebarLeft",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "obsidian", text: "primary", background: "white" },
  spacing: "compact",
  headerVariant: "minimal-top",
  contactVariant: "sidebar",
  sections: {
    header: "minimal",
    experience: "compact",
    skills: "pills",
    education: "compact",
    projects: "compact",
    summary: "minimal",
    contact: "sidebar",
    divider: "standard",
  },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
