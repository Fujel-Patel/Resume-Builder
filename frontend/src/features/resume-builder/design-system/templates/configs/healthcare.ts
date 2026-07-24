import type { TemplateConfig } from "../types"

export const healthcareConfig: TemplateConfig = {
  id: "healthcare",
  name: "Healthcare",
  description: "Clean healthcare template with calming teal accents. HIPAA-friendly.",
  category: "professional",
  tags: ["healthcare", "medical", "clinical", "nursing"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "dmSans", body: "inter" },
  colors: { palette: "teal", text: "primary", background: "white" },
  spacing: "airy",
  headerVariant: "centered",
  contactVariant: "chips",
  sections: {
    header: "centered",
    experience: "timeline",
    skills: "pills",
    education: "timeline",
    projects: "standard",
    summary: "standard",
    contact: "chips",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
