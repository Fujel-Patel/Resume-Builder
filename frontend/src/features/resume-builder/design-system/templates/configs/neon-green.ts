import type { TemplateConfig } from "../types"

export const neonGreenConfig: TemplateConfig = {
  id: "neon-green",
  name: "Neon Green",
  description: "Clean single-column with green accent underlines. Modern, bold, eye-catching.",
  category: "professional",
  tags: ["modern", "tech", "creative", "bold", "minimal"],
  layout: "single",
  grid: "single",
  pageMargin: "wide",
  fonts: {
    heading: "inter",
    body: "inter",
  },
  colors: {
    palette: "emerald",
    text: "primary",
    background: "white",
  },
  spacing: "normal",
  sections: {
    header: "underline-accent",
    experience: "standard",
    skills: "compact",
    education: "standard",
    projects: "standard",
    contact: "inline",
    divider: "accent",
  },
  features: {
    showProfileImage: true,
    showIcons: true,
    showDivider: false,
    accentHeaders: true,
  },
}
