import type { TemplateConfig } from "../types"

export const atsCompactConfig: TemplateConfig = {
  id: "ats-compact",
  name: "ATS Compact",
  description: "Dense layout for fitting more content. Space-efficient ATS format.",
  category: "ats",
  tags: ["ats", "compact", "dense", "efficient"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "slate", text: "primary", background: "white" },
  spacing: "compact",
  sections: { header: "standard", experience: "compact", skills: "compact", education: "compact", projects: "compact", contact: "inline", divider: "standard" },
  features: { showProfileImage: false, showIcons: false, showDivider: false, accentHeaders: false },
}
