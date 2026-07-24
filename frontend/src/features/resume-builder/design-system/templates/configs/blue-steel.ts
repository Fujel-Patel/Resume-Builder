import type { TemplateConfig } from "../types"

export const blueSteelConfig: TemplateConfig = {
  id: "blue-steel",
  name: "Blue Steel",
  description: "Minimalist European design with elegant serif typography and magazine-style layout.",
  category: "professional",
  tags: ["executive", "ats-friendly", "professional", "serif"],
  layout: "magazine",
  grid: "single",
  pageMargin: "narrow",
  fonts: { heading: "playfairDisplay", body: "inter" },
  colors: { palette: "blueSteel", text: "primary", background: "lightGray" },
  spacing: "normal",
  contactVariant: "grid",
  sections: {
    header: "two-tone",
    experience: "bullets",
    skills: "grouped",
    education: "standard",
    projects: "card",
    summary: "standard",
    contact: "grid",
    divider: "standard",
  },
  features: { showProfileImage: false, showIcons: true, showDivider: false, accentHeaders: true },
}
