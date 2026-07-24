import type { TemplateConfig } from "../types"

export const consultantConfig: TemplateConfig = {
  id: "consultant",
  name: "Consultant",
  description: "Clean, structured template for management consultants. Results-focused.",
  category: "professional",
  tags: ["consultant", "mckinsey", "strategy", "structured"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "charcoal", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "sidebar",
  sections: {
    header: "two-tone",
    experience: "role-first",
    skills: "categories",
    education: "detailed",
    projects: "featured",
    summary: "highlight",
    contact: "sidebar",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
