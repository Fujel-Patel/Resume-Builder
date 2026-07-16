import type { TemplateConfig } from "../types"

export const financeFormalConfig: TemplateConfig = {
  id: "finance-formal",
  name: "Finance Formal",
  description: "Traditional finance and banking template. Conservative, trust-building.",
  category: "professional",
  tags: ["finance", "banking", "conservative", "traditional"],
  layout: "single",
  grid: "single",
  pageMargin: "wide",
  fonts: { heading: "playfairDisplay", body: "lato" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "spacious",
  sections: { header: "divider", experience: "standard", skills: "compact", education: "detailed", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: true, showIcons: false, showDivider: true, accentHeaders: true },
}
