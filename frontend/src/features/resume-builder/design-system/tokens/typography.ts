export const fontFamilies = {
  inter: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  ibmPlexSans: "'IBM Plex Sans', sans-serif",
  sourceSans3: "'Source Sans 3', sans-serif",
  lato: "Lato, sans-serif",
  dmSans: "'DM Sans', sans-serif",
  geist: "Geist, sans-serif",
  playfairDisplay: "'Playfair Display', serif",
  jetBrainsMono: "'JetBrains Mono', monospace",
} as const

export type FontFamily = keyof typeof fontFamilies

export const typeScale = {
  nameXL:    { fontSize: 32, lineHeight: 1.15, fontWeight: 700 as const, letterSpacing: "-0.02em" },
  nameLG:    { fontSize: 28, lineHeight: 1.2,  fontWeight: 700 as const, letterSpacing: "-0.01em" },
  nameMD:    { fontSize: 24, lineHeight: 1.25, fontWeight: 600 as const, letterSpacing: "0" },
  titleLG:   { fontSize: 16, lineHeight: 1.3,  fontWeight: 400 as const, letterSpacing: "0.01em" },
  titleMD:   { fontSize: 14, lineHeight: 1.35, fontWeight: 400 as const, letterSpacing: "0" },
  titleSM:   { fontSize: 12, lineHeight: 1.4,  fontWeight: 500 as const, letterSpacing: "0" },
  headingLG: { fontSize: 13, lineHeight: 1.3,  fontWeight: 700 as const, letterSpacing: "0.05em" },
  headingMD: { fontSize: 11, lineHeight: 1.35, fontWeight: 700 as const, letterSpacing: "0.08em" },
  headingSM: { fontSize: 10, lineHeight: 1.4,  fontWeight: 600 as const, letterSpacing: "0.1em" },
  bodyLG:    { fontSize: 12, lineHeight: 1.55, fontWeight: 400 as const, letterSpacing: "0" },
  bodyMD:    { fontSize: 11, lineHeight: 1.5,  fontWeight: 400 as const, letterSpacing: "0" },
  bodySM:    { fontSize: 10, lineHeight: 1.45, fontWeight: 400 as const, letterSpacing: "0" },
  metaMD:    { fontSize: 10, lineHeight: 1.4,  fontWeight: 500 as const, letterSpacing: "0" },
  metaSM:    { fontSize: 9,  lineHeight: 1.35, fontWeight: 400 as const, letterSpacing: "0" },
  captionMD: { fontSize: 10, lineHeight: 1.4,  fontWeight: 400 as const, letterSpacing: "0" },
  captionSM: { fontSize: 9,  lineHeight: 1.35, fontWeight: 400 as const, letterSpacing: "0" },
} as const

export type TypeScaleToken = keyof typeof typeScale
