import type { TemplateConfig } from "../types"

export const atsCreativeSafeConfig: TemplateConfig = {
  id: "ats-creative-safe",
  name: "ATS Creative Safe",
  description: "Slightly creative accent colors while maintaining ATS compatibility.",
  category: "ats",
  tags: ["ats", "creative", "colorful", "safe"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "dmSans", body: "inter" },
  colors: { palette: "teal", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "chips",
  sections: {
    header: "border",
    experience: "bullets",
    skills: "tags",
    education: "standard",
    projects: "card",
    summary: "highlight",
    contact: "chips",
    divider: "accent",
  },
  features: {
    showProfileImage: false,
    showIcons: false,
    showDivider: false,
    accentHeaders: true,
  },
}
