import type { TemplateConfig } from "../types"

export const consultantConfig: TemplateConfig = {
  id: "consultant",
  name: "Consultant",
  description: "Clean, structured template for management consultants. Results-focused.",
  category: "professional",
  tags: ["consultant", "mckinsey", "strategy", "structured"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "charcoal", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "bold", experience: "detailed", skills: "standard", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: false, showIcons: true, showDivider: true, accentHeaders: true },
}
