import type { TemplateConfig } from "../types"

export const creativeElegantConfig: TemplateConfig = {
  id: "creative-elegant",
  name: "Creative Elegant",
  description: "Forest green with serif headings. Refined, nature-inspired elegance.",
  category: "creative",
  tags: ["creative", "elegant", "green", "refined"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "playfairDisplay", body: "lato" },
  colors: { palette: "charcoal", text: "primary", background: "white" },
  spacing: "spacious",
  headerVariant: "split",
  contactVariant: "sidebar",
  sections: {
    header: "editorial",
    experience: "magazine",
    skills: "categories",
    education: "magazine",
    projects: "featured",
    summary: "editorial",
    contact: "sidebar",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
