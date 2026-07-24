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
  fonts: { heading: "geist", body: "inter" },
  colors: { palette: "sage", text: "primary", background: "white" },
  spacing: "spacious",
  headerVariant: "minimal-top",
  contactVariant: "compact-icons",
  sections: {
    header: "minimal",
    experience: "role-first",
    skills: "grouped",
    education: "standard",
    projects: "standard",
    summary: "minimal",
    contact: "compact-icons",
    divider: "standard",
  },
  features: { showProfileImage: true, showIcons: true, showDivider: true, accentHeaders: true },
}
