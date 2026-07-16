export type ZoomLevel = 50 | 75 | 100 | 125 | 150 | 200
export type ZoomMode = ZoomLevel | "fit-width" | "fit-page"

export type ResumePageData = {
  pageIndex: number
  offsetY: number
}

export type PaginationResult = {
  pages: ResumePageData[]
  totalPages: number
  totalHeight: number
}
