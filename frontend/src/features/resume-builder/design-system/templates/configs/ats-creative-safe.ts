import type { TemplateConfig } from "../types"

export const atsCreativeSafeConfig: TemplateConfig = {
  id: "ats-creative-safe",
  name: "ATS Creative Safe",
  description: "Slightly creative accent colors while maintaining ATS compatibility.",
  category: "ats",
  tags: ["ats", "creative", "colorful", "safe"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "dmSans", body: "inter" },
  colors: { palette: "teal", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "underline-accent", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "accent" },
  features: { showProfileImage: false, showIcons: false, showDivider: false, accentHeaders: true },
}
