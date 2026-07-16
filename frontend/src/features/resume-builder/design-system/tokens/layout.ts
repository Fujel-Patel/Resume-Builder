export const A4 = {
  WIDTH_PX: 794,
  HEIGHT_PX: 1123,
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
} as const

export const pageMargins = {
  standard:   { top: 32, right: 32, bottom: 32, left: 32 },
  narrow:     { top: 24, right: 24, bottom: 24, left: 24 },
  wide:       { top: 40, right: 40, bottom: 40, left: 40 },
  asymmetric: { top: 32, right: 32, bottom: 32, left: 40 },
} as const

export type MarginPreset = keyof typeof pageMargins

export const gridSystems = {
  single:        { columns: [1], gap: 0 },
  singleWide:    { columns: [1], gap: 0 },
  split3070:     { columns: [0.30, 0.70], gap: 24 },
  split3565:     { columns: [0.35, 0.65], gap: 24 },
  split4060:     { columns: [0.40, 0.60], gap: 24 },
  goldenRatio:   { columns: [0.382, 0.618], gap: 24 },
  sidebarLeft:   { columns: [0.28, 0.72], gap: 20 },
  sidebarRight:  { columns: [0.72, 0.28], gap: 20 },
  narrowSidebar: { columns: [0.22, 0.78], gap: 16 },
} as const

export type GridSystem = keyof typeof gridSystems
