import type { TemplateConfig } from "../types"

export const startupFounderConfig: TemplateConfig = {
  id: "startup-founder",
  name: "Startup Founder",
  description: "Modern startup-style with hero banner, green accents, and prominent projects.",
  category: "professional",
  tags: ["startup", "founder", "modern", "hero"],
  layout: "hero-banner",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "inter", body: "inter" },
  colors: { palette: "emerald", text: "primary", background: "white" },
  spacing: "compact",
  contactVariant: "inline",
  sections: {
    header: "two-tone",
    experience: "bullets",
    skills: "list",
    education: "standard",
    projects: "standard",
    summary: "standard",
    contact: "inline",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
