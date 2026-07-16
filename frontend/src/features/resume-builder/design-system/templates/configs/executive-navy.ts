import type { TemplateConfig } from "../types"

export const executiveNavyConfig: TemplateConfig = {
  id: "executive-navy",
  name: "Executive Navy",
  description: "Deep navy blue with elegant serif headings. Board-level executive template.",
  category: "professional",
  tags: ["executive", "navy", "formal", "board", "c-suite"],
  layout: "single",
  grid: "single",
  pageMargin: "wide",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "spacious",
  sections: { header: "divider", experience: "detailed", skills: "standard", education: "detailed", projects: "standard", contact: "inline", divider: "standard" },
  features: { showProfileImage: true, showIcons: true, showDivider: true, accentHeaders: true },
}
