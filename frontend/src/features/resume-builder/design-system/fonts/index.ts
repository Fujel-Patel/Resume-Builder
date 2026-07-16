import type { FontFamily } from "../tokens/typography"

export const resumeFontFamilies: Record<FontFamily, string> = {
  inter: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  ibmPlexSans: "'IBM Plex Sans', sans-serif",
  sourceSans3: "'Source Sans 3', sans-serif",
  lato: "Lato, sans-serif",
  dmSans: "'DM Sans', sans-serif",
  geist: "Geist, sans-serif",
  playfairDisplay: "'Playfair Display', serif",
  jetBrainsMono: "'JetBrains Mono', monospace",
}

export function resolveFont(family: FontFamily): string {
  return resumeFontFamilies[family] ?? resumeFontFamilies.inter
}
