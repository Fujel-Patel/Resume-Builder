"use client"

import { memo, useCallback } from "react"
import type { ResumeData } from "@/types/resume"
import { usePagination } from "../engine/use-pagination"
import { A4, INLINE_PREVIEW_SCALE } from "../engine/constants"
import { templateMap } from "./templates"

type PreviewCanvasProps = {
  resume: ResumeData
  scale?: number
  onClick?: () => void
}

export const PreviewCanvas = memo(function PreviewCanvas({
  resume,
  scale = INLINE_PREVIEW_SCALE,
  onClick,
}: PreviewCanvasProps) {
  const { pages, MeasurePortal } = usePagination(resume)
  const TemplateComponent = templateMap[resume.templateId]

  const handleClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  if (!TemplateComponent) return null

  return (
    <div
      className="flex flex-col items-center py-6 gap-5 cursor-pointer select-none"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label="Open fullscreen resume preview"
    >
      <MeasurePortal resume={resume} />
      {pages.map((page) => (
        <div
          key={page.pageIndex}
          style={{
            width: `${A4.WIDTH_PX * scale}px`,
            height: `${A4.HEIGHT_PX * scale}px`,
            overflow: "hidden",
            borderRadius: "3px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: `${A4.WIDTH_PX}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              className="relative bg-white"
              style={{
                width: `${A4.WIDTH_PX}px`,
                height: `${A4.HEIGHT_PX}px`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${A4.WIDTH_PX}px`,
                  transform: `translateY(-${page.offsetY}px)`,
                  transformOrigin: "top left",
                }}
              >
                <TemplateComponent resume={resume} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})
