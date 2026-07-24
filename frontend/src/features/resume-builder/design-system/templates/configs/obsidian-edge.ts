import type { TemplateConfig } from "../types"

export const obsidianEdgeConfig: TemplateConfig = {
  id: "obsidian-edge",
  name: "Obsidian Edge",
  description: "Bold black header with white body. Icon section headings, clean modern design.",
  category: "professional",
  tags: ["bold", "contrast", "modern", "dark-header", "ATS Friendly"],
  layout: "hero-banner",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "obsidian", text: "primary", background: "white" },
  spacing: "compact",
  contactVariant: "grid",
  sections: {
    header: "icon-left",
    experience: "bullets",
    skills: "three-column",
    education: "standard",
    projects: "standard",
    summary: "standard",
    contact: "grid",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
