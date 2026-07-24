import type { TemplateConfig } from "../types"

export const financeFormalConfig: TemplateConfig = {
  id: "finance-formal",
  name: "Finance Formal",
  description: "Traditional finance and banking template. Conservative, trust-building.",
  category: "professional",
  tags: ["finance", "banking", "conservative", "traditional"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "centered",
  contactVariant: "two-rows",
  sections: {
    header: "centered",
    experience: "bullets",
    skills: "grouped",
    education: "detailed",
    projects: "standard",
    summary: "standard",
    contact: "two-rows",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: false, showDivider: false, accentHeaders: true },
}
