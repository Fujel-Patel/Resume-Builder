import type { TemplateConfig } from "../types"

export const neonGreenConfig: TemplateConfig = {
  id: "neon-green",
  name: "Neon Green",
  description: "Modern software-engineer resume with clean typography and vibrant green accents.",
  category: "professional",
  tags: ["ats-friendly", "modern", "professional", "green"],
  layout: "single",
  grid: "single",
  pageMargin: "standard",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "neonGreen", text: "primary", background: "white" },
  spacing: "compact",
  headerVariant: "classic",
  contactVariant: "grid",
  sections: {
    header: "accent-line",
    experience: "bullets",
    skills: "grouped",
    education: "standard",
    projects: "standard",
    summary: "standard",
    contact: "grid",
    divider: "standard",
  },
  features: { showProfileImage: true, showIcons: true, showDivider: true, accentHeaders: true },
}
