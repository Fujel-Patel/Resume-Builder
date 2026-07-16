import type { TemplateConfig } from "../types"

export const atsMinimalConfig: TemplateConfig = {
  id: "ats-minimal",
  name: "ATS Minimal",
  description: "Bare minimum styling for maximum parseability by ATS systems.",
  category: "ats",
  tags: ["ats", "minimal", "plain", "parseable"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "slate", text: "primary", background: "white" },
  spacing: "compact",
  sections: { header: "standard", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: false, showIcons: false, showDivider: false, accentHeaders: false },
}
