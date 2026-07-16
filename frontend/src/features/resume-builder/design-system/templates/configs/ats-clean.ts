import type { TemplateConfig } from "../types"

export const atsCleanConfig: TemplateConfig = {
  id: "ats-clean",
  name: "ATS Clean",
  description: "Ultra-clean, max ATS compatibility. No graphics, pure text.",
  category: "ats",
  tags: ["ats", "clean", "simple", "minimal"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "slate", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "standard", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: false, showIcons: false, showDivider: true, accentHeaders: false },
}
