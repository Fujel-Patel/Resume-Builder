"use client"

import { memo } from "react"
import type { ResumeData } from "@/types/resume"
import type { ResumePageData } from "../engine/types"
import { A4 } from "../engine/constants"
import { templateMap } from "./templates"

type PaginatedPageProps = {
  resume: ResumeData
  page: ResumePageData
  totalPages: number
  showPageNumber?: boolean
}

export const PaginatedPage = memo(function PaginatedPage({
  resume,
  page,
  totalPages,
  showPageNumber = true,
}: PaginatedPageProps) {
  const TemplateComponent = templateMap[resume.templateId]

  return (
    <div
      data-page-index={page.pageIndex}
      className="relative bg-white shrink-0"
      style={{
        width: `${A4.WIDTH_PX}px`,
        height: `${A4.HEIGHT_PX}px`,
        overflow: "hidden",
        borderRadius: "3px",
        boxShadow: "0 2px 20px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: `${A4.WIDTH_PX}px`,
          transform: `translateY(-${page.offsetY}px)`,
          transformOrigin: "top left",
        }}
      >
        {TemplateComponent && <TemplateComponent resume={resume} />}
      </div>

      {showPageNumber && totalPages > 1 && (
        <div
          className="absolute bottom-2 right-4 text-[9px] text-gray-400 select-none pointer-events-none"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {page.pageIndex + 1} / {totalPages}
        </div>
      )}
    </div>
  )
})
