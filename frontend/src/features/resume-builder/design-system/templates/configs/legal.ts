import type { TemplateConfig } from "../types"

export const legalConfig: TemplateConfig = {
  id: "legal",
  name: "Legal",
  description: "Formal legal template with serif fonts. Court-ready, authoritative.",
  category: "professional",
  tags: ["legal", "law", "attorney", "formal"],
  layout: "single",
  grid: "single",
  pageMargin: "wide",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "burgundy", text: "primary", background: "white" },
  spacing: "spacious",
  sections: { header: "divider", experience: "detailed", education: "detailed", skills: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: false, showIcons: false, showDivider: true, accentHeaders: true },
}
