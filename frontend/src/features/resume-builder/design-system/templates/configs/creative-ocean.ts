import type { TemplateConfig } from "../types"

export const creativeOceanConfig: TemplateConfig = {
  id: "creative-ocean",
  name: "Creative Ocean",
  description: "Ocean blue with light background. Fresh, airy, professional creative.",
  category: "creative",
  tags: ["creative", "ocean", "blue", "fresh"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "geist", body: "dmSans" },
  colors: { palette: "ocean", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "centered",
  contactVariant: "right-aligned",
  sections: {
    header: "two-tone",
    experience: "bullets",
    skills: "three-column",
    education: "standard",
    projects: "detailed",
    summary: "standard",
    contact: "right-aligned",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
