import type { TemplateConfig } from "../types"

export const atsBoldHeadingsConfig: TemplateConfig = {
  id: "ats-bold-headings",
  name: "ATS Bold Headings",
  description: "Bold section headings for visual hierarchy while staying ATS-safe.",
  category: "ats",
  tags: ["ats", "bold", "structured", "readable"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "charcoal", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "bold", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: false, showIcons: false, showDivider: true, accentHeaders: true },
}
