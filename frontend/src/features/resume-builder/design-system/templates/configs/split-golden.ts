import type { TemplateConfig } from "../types"

export const splitGoldenConfig: TemplateConfig = {
  id: "split-golden",
  name: "Split Golden",
  description: "Golden ratio two-column split. Naturally pleasing proportions.",
  category: "two-column",
  tags: ["split", "golden-ratio", "proportional", "elegant"],
  layout: "two-column-left",
  grid: "goldenRatio",
  pageMargin: "narrow",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "charcoal", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "two-rows",
  sections: {
    header: "editorial",
    experience: "magazine",
    skills: "categories",
    education: "magazine",
    projects: "featured",
    summary: "editorial",
    contact: "two-rows",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: false, showDivider: false, accentHeaders: true },
}
