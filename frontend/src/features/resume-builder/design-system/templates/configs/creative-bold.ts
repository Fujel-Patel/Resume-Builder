import type { TemplateConfig } from "../types"

export const creativeBoldConfig: TemplateConfig = {
  id: "creative-bold",
  name: "Creative Bold",
  description: "Crimson red with bold headers. High-impact, attention-grabbing design.",
  category: "creative",
  tags: ["creative", "bold", "red", "impact"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "crimson", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "bold", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: true, showIcons: true, showDivider: true, accentHeaders: true },
}
