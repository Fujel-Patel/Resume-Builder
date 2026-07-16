import type { TemplateConfig } from "../types"

export const obsidianEdgeConfig: TemplateConfig = {
  id: "obsidian-edge",
  name: "Obsidian Edge",
  description:
    "Bold black header with white body. Icon section headings, multi-column skills, print-ready A4.",
  category: "professional",
  tags: ["bold", "contrast", "modern", "dark-header", "ATS Friendly"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: {
    heading: "inter",
    body: "inter",
  },
  colors: {
    palette: "obsidian",
    text: "primary",
    background: "white",
  },
  spacing: "compact",
  sections: {
    header: "bold",
    experience: "compact",
    skills: "compact",
    education: "compact",
    projects: "compact",
    contact: "inline",
    divider: "standard",
  },
  features: {
    showProfileImage: false,
    showIcons: true,
    showDivider: false,
    accentHeaders: false,
  },
}
