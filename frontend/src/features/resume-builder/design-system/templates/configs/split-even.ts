import type { TemplateConfig } from "../types"

export const splitEvenConfig: TemplateConfig = {
  id: "split-even",
  name: "Split Even",
  description: "50/50 two-column split. Balanced information distribution.",
  category: "two-column",
  tags: ["split", "balanced", "50-50", "equal"],
  layout: "two-column-left",
  grid: "split4060",
  pageMargin: "standard",
  fonts: { heading: "ibmPlexSans", body: "inter" },
  colors: { palette: "slate", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "underline", experience: "standard", skills: "compact", education: "standard", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: true, showIcons: true, showDivider: true, accentHeaders: false },
}
