import type { TemplateConfig } from "../types"

export const obsidianEdgeConfig: TemplateConfig = {
  id: "obsidian-edge",
  name: "Obsidian Edge",
  description: "Black header with light gray body. Bold contrast, emoji section icons.",
  category: "professional",
  tags: ["bold", "contrast", "modern", "dark-header"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: {
    heading: "inter",
    body: "inter",
  },
  colors: {
    palette: "slate",
    text: "primary",
    background: "lightGray",
  },
  spacing: "normal",
  sections: {
    header: "bold",
    experience: "standard",
    skills: "compact",
    education: "standard",
    projects: "standard",
    contact: "inline",
    divider: "standard",
  },
  features: {
    showProfileImage: true,
    showIcons: true,
    showDivider: false,
    accentHeaders: false,
  },
}
