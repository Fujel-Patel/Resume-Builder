import type { TemplateConfig } from "../types"

export const graduateEntryConfig: TemplateConfig = {
  id: "graduate-entry",
  name: "Graduate Entry",
  description: "Clean entry-level template with centered header emphasizing education and projects.",
  category: "ats",
  tags: ["graduate", "entry-level", "ats-friendly", "centered"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "steel", text: "primary", background: "white" },
  spacing: "compact",
  headerVariant: "centered",
  contactVariant: "inline",
  sections: {
    header: "two-tone",
    experience: "bullets",
    skills: "grouped",
    education: "detailed",
    projects: "standard",
    summary: "minimal",
    contact: "inline",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: true, accentHeaders: true },
}
