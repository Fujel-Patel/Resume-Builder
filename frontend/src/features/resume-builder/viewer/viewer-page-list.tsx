"use client"

import { useRef, useCallback, useEffect } from "react"
import type { ResumeData } from "@/types/resume"
import type { ResumePageData } from "../engine/types"
import { A4, PAGE_GAP_PX } from "../engine/constants"
import { PaginatedPage } from "../preview/paginated-page"

type ViewerPageListProps = {
  resume: ResumeData
  pages: ResumePageData[]
  totalPages: number
  scale: number
  onPageChange?: (pageIndex: number) => void
}

export function ViewerPageList({
  resume,
  pages,
  totalPages,
  scale,
  onPageChange,
}: ViewerPageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const setPageRef = useCallback(
    (pageIndex: number) => (el: HTMLDivElement | null) => {
      if (el) {
        pageRefs.current.set(pageIndex, el)
      } else {
        pageRefs.current.delete(pageIndex)
      }
    },
    []
  )

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-page-idx"))
            if (!isNaN(idx)) onPageChange?.(idx)
          }
        }
      },
      {
        root: scrollEl,
        threshold: 0.5,
      }
    )

    pageRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pages, onPageChange])

  const totalGap = (totalPages - 1) * PAGE_GAP_PX
  const scaledPageW = A4.WIDTH_PX * scale
  const scaledPageH = A4.HEIGHT_PX * scale

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-auto bg-zinc-950"
      style={{ scrollBehavior: "smooth" }}
    >
      <div
        className="flex flex-col items-center py-6"
        style={{ minHeight: "100%" }}
      >
        {pages.map((page) => (
          <div
            key={page.pageIndex}
            ref={setPageRef(page.pageIndex)}
            data-page-idx={page.pageIndex}
            style={{
              width: `${scaledPageW}px`,
              height: `${scaledPageH}px`,
              marginBottom: page.pageIndex < totalPages - 1 ? `${PAGE_GAP_PX * scale}px` : 0,
              overflow: "hidden",
              borderRadius: "3px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: `${A4.WIDTH_PX}px`,
                height: `${A4.HEIGHT_PX}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <PaginatedPage
                resume={resume}
                page={page}
                totalPages={totalPages}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
