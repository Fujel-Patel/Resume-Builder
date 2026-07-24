import type { TemplateConfig } from "../types"

export const corporateGrayConfig: TemplateConfig = {
  id: "corporate-gray",
  name: "Corporate Gray",
  description: "Neutral gray tones for a professional, understated corporate look.",
  category: "professional",
  tags: ["corporate", "gray", "neutral", "conservative"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "ibmPlexSans", body: "inter" },
  colors: { palette: "warmGray", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "minimal-top",
  contactVariant: "grid",
  sections: {
    header: "minimal",
    experience: "bullets",
    skills: "matrix",
    education: "compact",
    projects: "compact",
    summary: "standard",
    contact: "grid",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
