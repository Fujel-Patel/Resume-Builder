import type { TemplateConfig } from "../types"

export const splitGoldenConfig: TemplateConfig = {
  id: "split-golden",
  name: "Split Golden",
  description: "Golden ratio two-column split. Naturally pleasing proportions.",
  category: "two-column",
  tags: ["split", "golden-ratio", "proportional", "elegant"],
  layout: "two-column-left",
  grid: "goldenRatio",
  pageMargin: "standard",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "burgundy", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "divider", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: true, showIcons: false, showDivider: true, accentHeaders: true },
}
