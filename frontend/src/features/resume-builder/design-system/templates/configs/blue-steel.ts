import type { TemplateConfig } from "../types"

export const blueSteelConfig: TemplateConfig = {
  id: "blue-steel",
  name: "Blue Steel",
  description: "Card-based layout with dot proficiency indicators. Professional with visual flair.",
  category: "professional",
  tags: ["cards", "professional", "modern", "structured"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: {
    heading: "playfairDisplay",
    body: "inter",
  },
  colors: {
    palette: "steel",
    text: "primary",
    background: "lightGray",
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
