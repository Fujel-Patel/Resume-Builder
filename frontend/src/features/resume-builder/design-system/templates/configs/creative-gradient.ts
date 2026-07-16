import type { TemplateConfig } from "../types"

export const creativeGradientConfig: TemplateConfig = {
  id: "creative-gradient",
  name: "Creative Gradient",
  description: "Deep purple accents with off-white background. Rich, creative feel.",
  category: "creative",
  tags: ["creative", "purple", "gradient", "artistic"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "dmSans", body: "inter" },
  colors: { palette: "deepPurple", text: "primary", background: "offWhite" },
  spacing: "normal",
  sections: { header: "boxed", experience: "standard", skills: "compact", education: "standard", projects: "detailed", contact: "inline", divider: "accent" },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
