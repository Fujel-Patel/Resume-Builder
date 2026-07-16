export type AccentPalette = {
  name: string
  primary: string
  light: string
  muted: string
  text: string
}

export const accentPalettes: Record<string, AccentPalette> = {
  slate:      { name: "Slate",        primary: "#475569", light: "#f1f5f9", muted: "#e2e8f0", text: "#ffffff" },
  navy:       { name: "Navy",         primary: "#1e3a5f", light: "#eff6ff", muted: "#dbeafe", text: "#ffffff" },
  indigo:     { name: "Indigo",       primary: "#4f46e5", light: "#eef2ff", muted: "#e0e7ff", text: "#ffffff" },
  emerald:    { name: "Emerald",      primary: "#059669", light: "#ecfdf5", muted: "#d1fae5", text: "#ffffff" },
  teal:       { name: "Teal",         primary: "#0d9488", light: "#f0fdfa", muted: "#ccfbf1", text: "#ffffff" },
  burgundy:   { name: "Burgundy",     primary: "#9f1239", light: "#fff1f2", muted: "#fecdd3", text: "#ffffff" },
  charcoal:   { name: "Charcoal",     primary: "#36454f", light: "#f8fafc", muted: "#e2e8f0", text: "#ffffff" },
  forest:     { name: "Forest Green", primary: "#166534", light: "#f0fdf4", muted: "#dcfce7", text: "#ffffff" },
  steel:      { name: "Steel Blue",   primary: "#4682b4", light: "#f0f7ff", muted: "#dbeafe", text: "#ffffff" },
  deepPurple: { name: "Deep Purple",  primary: "#5b21b6", light: "#f5f3ff", muted: "#ede9fe", text: "#ffffff" },
  crimson:    { name: "Crimson",      primary: "#dc2626", light: "#fef2f2", muted: "#fee2e2", text: "#ffffff" },
  ocean:      { name: "Ocean Blue",   primary: "#0369a1", light: "#f0f9ff", muted: "#e0f2fe", text: "#ffffff" },
  sage:       { name: "Sage Green",   primary: "#65a30d", light: "#f7fee7", muted: "#ecfccb", text: "#ffffff" },
  warmGray:   { name: "Warm Gray",    primary: "#78716c", light: "#fafaf9", muted: "#e7e5e4", text: "#ffffff" },
  obsidian:   { name: "Obsidian",     primary: "#18181b", light: "#f4f4f5", muted: "#e4e4e7", text: "#ffffff" },
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
