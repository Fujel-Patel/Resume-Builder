import type { TemplateConfig } from "../types"

export const creativeGradientConfig: TemplateConfig = {
  id: "creative-gradient",
  name: "Creative Gradient",
  description: "Deep purple accents with off-white background. Rich, creative feel.",
  category: "creative",
  tags: ["creative", "purple", "gradient", "artistic"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "dmSans", body: "inter" },
  colors: { palette: "deepPurple", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "classic",
  contactVariant: "two-rows",
  sections: {
    header: "numbered",
    experience: "timeline",
    skills: "tags",
    education: "standard",
    projects: "card",
    summary: "highlight",
    contact: "two-rows",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
