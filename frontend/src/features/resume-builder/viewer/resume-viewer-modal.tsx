"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type { ResumeData } from "@/types/resume"
import { usePagination } from "../engine/use-pagination"
import { A4 } from "../engine/constants"
import type { ZoomMode } from "../engine/constants"
import { useViewerZoom } from "./use-viewer-zoom"
import { ViewerToolbar } from "./viewer-toolbar"
import { ViewerPageList } from "./viewer-page-list"
import { exportResumeAsPdfClient } from "../export/pdf-export-client"

type ResumeViewerModalProps = {
  resume: ResumeData
  isOpen: boolean
  onClose: () => void
}

export function ResumeViewerModal({
  resume,
  isOpen,
  onClose,
}: ResumeViewerModalProps) {
  const { pages, totalPages, MeasurePortal } = usePagination(resume)
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { zoomMode, zoomPercent, scale, zoomIn, zoomOut, fitWidth, fitPage, resetZoom } =
    useViewerZoom(containerRef)

  const handleSetZoom = useCallback(
    (mode: ZoomMode) => {
      if (mode === "fit-width" || mode === "fit-page") {
        if (mode === "fit-width") fitWidth()
        else fitPage()
      } else {
        const { zoomMode: _zm, ...rest } = { zoomMode: mode }
        void _zm
      }
    },
    [fitWidth, fitPage]
  )

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault()
          zoomIn()
        } else if (e.key === "-") {
          e.preventDefault()
          zoomOut()
        } else if (e.key === "0") {
          e.preventDefault()
          resetZoom()
        }
      }
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === "+" || e.key === "=") zoomIn()
        else if (e.key === "-") zoomOut()
        else if (e.key === "0") resetZoom()
        else if (e.key === "f" || e.key === "F") fitWidth()
        else if (e.key === "p" || e.key === "P") fitPage()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, zoomIn, zoomOut, resetZoom, fitWidth, fitPage])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      fitWidth()
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, fitWidth])

  const handleDownload = useCallback(async () => {
    setIsExporting(true)
    try {
      await exportResumeAsPdfClient(resume, pages, A4, scale)
    } catch (err) {
      console.error("PDF export failed:", err)
    } finally {
      setIsExporting(false)
    }
  }, [resume, pages, scale])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Resume preview"
    >
      <MeasurePortal resume={resume} />
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex flex-col h-full">
        <ViewerToolbar
          resumeName={resume.name || "Resume"}
          currentPage={currentPage}
          totalPages={totalPages}
          zoomMode={zoomMode}
          zoomPercent={zoomPercent}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitWidth={fitWidth}
          onFitPage={fitPage}
          onResetZoom={resetZoom}
          onSetZoom={handleSetZoom}
          onDownload={handleDownload}
          onPrint={handlePrint}
          onClose={onClose}
          isExporting={isExporting}
        />

        <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
          <ViewerPageList
            resume={resume}
            pages={pages}
            totalPages={totalPages}
            scale={scale}
            onPageChange={(idx) => setCurrentPage(idx + 1)}
          />
        </div>
      </div>
    </div>
  )
}
