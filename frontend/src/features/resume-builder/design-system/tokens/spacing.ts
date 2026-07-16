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
  compact:  { sectionGap: 12, itemGap: 6,  intraGap: 4 },
  normal:   { sectionGap: 16, itemGap: 8,  intraGap: 6 },
  spacious: { sectionGap: 24, itemGap: 12, intraGap: 8 },
} as const

export type SpacingPreset = keyof typeof spacingPresets
