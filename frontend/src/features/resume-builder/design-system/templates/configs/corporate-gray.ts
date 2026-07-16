import type { TemplateConfig } from "../types"

export const corporateGrayConfig: TemplateConfig = {
  id: "corporate-gray",
  name: "Corporate Gray",
  description: "Neutral gray tones for a professional, understated corporate look.",
  category: "professional",
  tags: ["corporate", "gray", "neutral", "conservative"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "ibmPlexSans", body: "inter" },
  colors: { palette: "warmGray", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "underline", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: true, showIcons: true, showDivider: true, accentHeaders: false },
}
