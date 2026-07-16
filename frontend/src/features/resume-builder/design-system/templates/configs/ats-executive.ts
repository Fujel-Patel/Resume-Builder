import type { TemplateConfig } from "../types"

export const atsExecutiveConfig: TemplateConfig = {
  id: "ats-executive",
  name: "ATS Executive",
  description: "Formal executive-level ATS template. Navy and charcoal tones.",
  category: "ats",
  tags: ["ats", "executive", "formal", "corporate"],
  layout: "single",
  grid: "single",
  pageMargin: "wide",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "spacious",
  sections: { header: "divider", experience: "detailed", skills: "standard", education: "detailed", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: false, showIcons: false, showDivider: true, accentHeaders: true },
}
