export const A4 = {
  WIDTH_PX: 794,
  HEIGHT_PX: 1123,
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
} as const

export const PAGE_GAP_PX = 24

export const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200] as const
export type ZoomLevel = (typeof ZOOM_LEVELS)[number]
export type ZoomMode = ZoomLevel | "fit-width" | "fit-page"

export const INLINE_PREVIEW_SCALE = 0.55
