import type { TemplateConfig } from "../types"

export const creativeBoldConfig: TemplateConfig = {
  id: "creative-bold",
  name: "Creative Bold",
  description: "Crimson red with bold headers. High-impact, attention-grabbing design.",
  category: "creative",
  tags: ["creative", "bold", "red", "impact"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "crimson", text: "primary", background: "white" },
  spacing: "compact",
  headerVariant: "banner",
  contactVariant: "chips",
  sections: {
    header: "minimal",
    experience: "bullets",
    skills: "pills",
    education: "standard",
    projects: "standard",
    summary: "standard",
    contact: "chips",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
