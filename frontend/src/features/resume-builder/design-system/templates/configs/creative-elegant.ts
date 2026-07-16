import type { TemplateConfig } from "../types"

export const creativeElegantConfig: TemplateConfig = {
  id: "creative-elegant",
  name: "Creative Elegant",
  description: "Forest green with serif headings. Refined, nature-inspired elegance.",
  category: "creative",
  tags: ["creative", "elegant", "green", "refined"],
  layout: "single",
  grid: "single",
  pageMargin: "wide",
  fonts: { heading: "playfairDisplay", body: "lato" },
  colors: { palette: "forest", text: "primary", background: "white" },
  spacing: "spacious",
  sections: { header: "divider", experience: "detailed", skills: "standard", education: "detailed", projects: "detailed", contact: "inline", divider: "standard" },
  features: { showProfileImage: true, showIcons: false, showDivider: true, accentHeaders: true },
}
