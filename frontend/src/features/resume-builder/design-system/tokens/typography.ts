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
  nameXL:    { fontSize: 34, lineHeight: 1.1, fontWeight: 800 as const, letterSpacing: "-0.03em" },
  nameLG:    { fontSize: 28, lineHeight: 1.15, fontWeight: 700 as const, letterSpacing: "-0.02em" },
  nameMD:    { fontSize: 22, lineHeight: 1.2, fontWeight: 700 as const, letterSpacing: "-0.01em" },
  titleLG:   { fontSize: 15, lineHeight: 1.3, fontWeight: 400 as const, letterSpacing: "0.01em" },
  titleMD:   { fontSize: 13, lineHeight: 1.35, fontWeight: 400 as const, letterSpacing: "0" },
  titleSM:   { fontSize: 11, lineHeight: 1.4, fontWeight: 500 as const, letterSpacing: "0.01em" },
  headingLG: { fontSize: 12, lineHeight: 1.3, fontWeight: 700 as const, letterSpacing: "0.06em" },
  headingMD: { fontSize: 11, lineHeight: 1.35, fontWeight: 700 as const, letterSpacing: "0.08em" },
  headingSM: { fontSize: 10, lineHeight: 1.4, fontWeight: 600 as const, letterSpacing: "0.1em" },
  bodyLG:    { fontSize: 11, lineHeight: 1.6, fontWeight: 400 as const, letterSpacing: "0" },
  bodyMD:    { fontSize: 10.5, lineHeight: 1.55, fontWeight: 400 as const, letterSpacing: "0" },
  bodySM:    { fontSize: 10, lineHeight: 1.5, fontWeight: 400 as const, letterSpacing: "0" },
  metaMD:    { fontSize: 10, lineHeight: 1.4, fontWeight: 500 as const, letterSpacing: "0.01em" },
  metaSM:    { fontSize: 9.5, lineHeight: 1.4, fontWeight: 400 as const, letterSpacing: "0" },
  captionMD: { fontSize: 9.5, lineHeight: 1.4, fontWeight: 400 as const, letterSpacing: "0" },
  captionSM: { fontSize: 9, lineHeight: 1.35, fontWeight: 400 as const, letterSpacing: "0.01em" },
} as const

export type TypeScaleToken = keyof typeof typeScale
