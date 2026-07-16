import type { TemplateConfig } from "../types"

export const creativeOceanConfig: TemplateConfig = {
  id: "creative-ocean",
  name: "Creative Ocean",
  description: "Ocean blue with light background. Fresh, airy, professional creative.",
  category: "creative",
  tags: ["creative", "ocean", "blue", "fresh"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "sourceSans3", body: "inter" },
  colors: { palette: "ocean", text: "primary", background: "offWhite" },
  spacing: "normal",
  sections: { header: "underline-accent", experience: "standard", skills: "compact", education: "standard", projects: "detailed", contact: "inline", divider: "accent" },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
