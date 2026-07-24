export type AccentPalette = {
  name: string
  primary: string
  light: string
  muted: string
  text: string
}

export const accentPalettes: Record<string, AccentPalette> = {
  slate:      { name: "Slate",        primary: "#475569", light: "#f8fafc", muted: "#e2e8f0", text: "#ffffff" },
  navy:       { name: "Navy",         primary: "#1e3a5f", light: "#f0f5ff", muted: "#c7d9f0", text: "#ffffff" },
  indigo:     { name: "Indigo",       primary: "#4338ca", light: "#eef2ff", muted: "#c7d2fe", text: "#ffffff" },
  emerald:    { name: "Emerald",      primary: "#047857", light: "#ecfdf5", muted: "#a7f3d0", text: "#ffffff" },
  teal:       { name: "Teal",         primary: "#0f766e", light: "#f0fdfa", muted: "#99f6e4", text: "#ffffff" },
  burgundy:   { name: "Burgundy",     primary: "#9f1239", light: "#fff1f2", muted: "#fecdd3", text: "#ffffff" },
  charcoal:   { name: "Charcoal",     primary: "#2e3440", light: "#f8fafc", muted: "#d5d9e0", text: "#ffffff" },
  forest:     { name: "Forest Green", primary: "#15803d", light: "#f0fdf4", muted: "#bbf7d0", text: "#ffffff" },
  steel:      { name: "Steel Blue",   primary: "#3b7dd8", light: "#f0f7ff", muted: "#bfdbfe", text: "#ffffff" },
  deepPurple: { name: "Deep Purple",  primary: "#6d28d9", light: "#f5f3ff", muted: "#ddd6fe", text: "#ffffff" },
  crimson:    { name: "Crimson",      primary: "#dc2626", light: "#fef2f2", muted: "#fecaca", text: "#ffffff" },
  ocean:      { name: "Ocean Blue",   primary: "#0284c7", light: "#f0f9ff", muted: "#bae6fd", text: "#ffffff" },
  sage:       { name: "Sage Green",   primary: "#4d7c0f", light: "#f7fee7", muted: "#bef264", text: "#ffffff" },
  warmGray:   { name: "Warm Gray",    primary: "#57534e", light: "#fafaf9", muted: "#d6d3d1", text: "#ffffff" },
  obsidian:   { name: "Obsidian",     primary: "#18181b", light: "#f4f4f5", muted: "#d4d4d8", text: "#ffffff" },
  neonGreen:  { name: "Neon Green",   primary: "#3DDC97", light: "#ecfdf5", muted: "#a7f3d0", text: "#111827" },
  indigoDark: { name: "Indigo Dark",  primary: "#4f46e5", light: "#eef2ff", muted: "#c7d2fe", text: "#ffffff" },
  blueSteel:  { name: "Blue Steel",   primary: "#2F3552", light: "#DCE4EA", muted: "#c5cdd8", text: "#ffffff" },
}

export type AccentName = keyof typeof accentPalettes

export const textColors = {
  primary:   "#111827",
  secondary: "#374151",
  muted:     "#6b7280",
  subtle:    "#9ca3af",
  white:     "#ffffff",
} as const

export type TextColorName = keyof typeof textColors

export const bgColors = {
  white:     "#ffffff",
  offWhite:  "#f9fafb",
  lightGray: "#f3f4f6",
  paleGray:  "#e5e7eb",
} as const

export type BgColorName = keyof typeof bgColors
