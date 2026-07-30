export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  8: 16,
  10: 20,
  12: 24,
  14: 28,
  16: 32,
  20: 40,
  24: 48,
} as const

export type SpacingToken = keyof typeof spacing

export const spacingPresets = {
  compact:    { sectionGap: 14, itemGap: 8,  intraGap: 4 },
  normal:     { sectionGap: 18, itemGap: 14, intraGap: 5 },
  spacious:   { sectionGap: 26, itemGap: 16, intraGap: 6 },
  editorial:  { sectionGap: 28, itemGap: 18, intraGap: 7 },
  dense:      { sectionGap: 12, itemGap: 6,  intraGap: 3 },
  airy:       { sectionGap: 32, itemGap: 20, intraGap: 8 },
  executive:  { sectionGap: 24, itemGap: 16, intraGap: 5 },
  nova:       { sectionGap: 16, itemGap: 12, intraGap: 4 },
} as const

export type SpacingPreset = keyof typeof spacingPresets
