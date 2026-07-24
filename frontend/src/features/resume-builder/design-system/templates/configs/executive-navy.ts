import type { TemplateConfig } from "../types"

export const executiveNavyConfig: TemplateConfig = {
  id: "executive-navy",
  name: "Executive Navy",
  description: "Deep navy blue with elegant serif headings. Board-level executive template.",
  category: "professional",
  tags: ["executive", "navy", "formal", "board", "c-suite"],
  layout: "single",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "playfairDisplay", body: "sourceSans3" },
  colors: { palette: "navy", text: "primary", background: "white" },
  spacing: "compact",
  headerVariant: "split",
  contactVariant: "right-aligned",
  sections: {
    header: "editorial",
    experience: "executive",
    skills: "grouped",
    education: "detailed",
    projects: "standard",
    summary: "editorial",
    contact: "right-aligned",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
