"use client"

import { useState, useLayoutEffect, useRef, useCallback, useMemo, memo } from "react"
import type { ResumeData } from "@/types/resume"
import { templateMap } from "../preview/templates"
import { A4 } from "./constants"
import type { PaginationResult } from "./types"

type PaginationHookResult = PaginationResult & {
  MeasurePortal: React.ComponentType<{ resume: ResumeData }>
}

const MeasurePortalImpl = memo(function MeasurePortalImpl({
  resume,
  onHeight,
}: {
  resume: ResumeData
  onHeight: (height: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const TemplateComponent = templateMap[resume.templateId]

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const height = el.scrollHeight || el.getBoundingClientRect().height
    onHeight(height)
  })

  if (!TemplateComponent) return null

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: -99999,
        left: -99999,
        width: A4.WIDTH_PX,
        visibility: "hidden",
        pointerEvents: "none",
        zIndex: -1,
        overflow: "visible",
      }}
    >
      <TemplateComponent resume={resume} />
    </div>
  )
})

export function usePagination(_resume: ResumeData): PaginationHookResult {
  const lastHeightRef = useRef<number>(A4.HEIGHT_PX)

  const [result, setResult] = useState<PaginationResult>({
    pages: [{ pageIndex: 0, offsetY: 0 }],
    totalPages: 1,
    totalHeight: A4.HEIGHT_PX as number,
  })

  const handleHeight = useCallback((height: number) => {
    const clampedHeight = Math.max(height, A4.HEIGHT_PX)
    if (clampedHeight === lastHeightRef.current) return
    lastHeightRef.current = clampedHeight

    const pageCount = Math.ceil(clampedHeight / A4.HEIGHT_PX)
    setResult({
      pages: Array.from({ length: pageCount }, (_, i) => ({
        pageIndex: i,
        offsetY: i * A4.HEIGHT_PX,
      })),
      totalPages: pageCount,
      totalHeight: clampedHeight,
    })
  }, [])

  const MeasurePortal = useMemo(
    () =>
      function MeasurePortal(props: { resume: ResumeData }) {
        return <MeasurePortalImpl resume={props.resume} onHeight={handleHeight} />
      },
    [handleHeight]
  )

  return { ...result, MeasurePortal }
}
