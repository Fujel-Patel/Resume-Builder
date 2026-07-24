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
  fonts: { heading: "ibmPlexSans", body: "dmSans" },
  colors: { palette: "teal", text: "primary", background: "white" },
  spacing: "normal",
  headerVariant: "centered",
  contactVariant: "right-aligned",
  sections: {
    header: "centered",
    experience: "bullets",
    skills: "three-column",
    education: "standard",
    projects: "standard",
    summary: "standard",
    contact: "right-aligned",
    divider: "standard",
  },
  features: { showProfileImage: true, showIcons: true, showDivider: true, accentHeaders: true },
}
