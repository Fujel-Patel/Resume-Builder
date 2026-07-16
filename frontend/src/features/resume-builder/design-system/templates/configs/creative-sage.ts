import type { TemplateConfig } from "../types"

export const creativeSageConfig: TemplateConfig = {
  id: "creative-sage",
  name: "Creative Sage",
  description: "Sage green minimalist design. Calm, eco-conscious, modern creative.",
  category: "creative",
  tags: ["creative", "sage", "minimalist", "eco"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "dmSans", body: "sourceSans3" },
  colors: { palette: "sage", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "underline", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
