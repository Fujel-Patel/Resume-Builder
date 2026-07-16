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
  fonts: { heading: "dmSans", body: "sourceSans3" },
  colors: { palette: "teal", text: "primary", background: "white" },
  spacing: "normal",
  sections: { header: "underline-accent", experience: "detailed", skills: "standard", education: "standard", projects: "standard", contact: "inline", divider: "accent" },
  features: { showProfileImage: true, showIcons: true, showDivider: false, accentHeaders: true },
}
