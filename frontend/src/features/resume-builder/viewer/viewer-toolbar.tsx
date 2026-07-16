"use client"

import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Columns2,
  RotateCcw,
  Download,
  Printer,
  X,
} from "lucide-react"
import type { ZoomMode } from "../engine/constants"
import { ZOOM_LEVELS } from "../engine/constants"

type ViewerToolbarProps = {
  resumeName: string
  currentPage: number
  totalPages: number
  zoomMode: ZoomMode
  zoomPercent: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitWidth: () => void
  onFitPage: () => void
  onResetZoom: () => void
  onSetZoom: (mode: ZoomMode) => void
  onDownload: () => void
  onPrint: () => void
  onClose: () => void
  isExporting?: boolean
}

export function ViewerToolbar({
  resumeName,
  currentPage,
  totalPages,
  zoomMode,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitPage,
  onResetZoom,
  onSetZoom,
  onDownload,
  onPrint,
  onClose,
  isExporting,
}: ViewerToolbarProps) {
  return (
    <div className="flex items-center justify-between h-12 px-4 bg-zinc-900 border-b border-zinc-800 text-zinc-100 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          aria-label="Close preview"
        >
          <X className="size-4" />
        </button>
        <div className="h-4 w-px bg-zinc-700" />
        <span className="text-sm font-medium truncate max-w-[200px]">{resumeName}</span>
        {totalPages > 1 && (
          <span className="text-xs text-zinc-400 ml-1">
            {currentPage} of {totalPages}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="size-4" />
        </button>

        <div className="relative group">
          <button className="px-2 py-1 text-xs font-mono rounded-md hover:bg-zinc-800 transition-colors min-w-[52px] text-center">
            {zoomMode === "fit-width"
              ? "Fit W"
              : zoomMode === "fit-page"
                ? "Fit P"
                : `${typeof zoomMode === "number" ? zoomMode : zoomPercent}%`}
          </button>
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1 min-w-[80px]">
            {ZOOM_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => onSetZoom(level)}
                className={`w-full px-3 py-1 text-xs text-left hover:bg-zinc-700 transition-colors ${
                  zoomMode === level ? "text-brand font-semibold" : "text-zinc-300"
                }`}
              >
                {level}%
              </button>
            ))}
            <div className="h-px bg-zinc-700 my-1" />
            <button
              onClick={onFitWidth}
              className={`w-full px-3 py-1 text-xs text-left hover:bg-zinc-700 transition-colors ${
                zoomMode === "fit-width" ? "text-brand font-semibold" : "text-zinc-300"
              }`}
            >
              Fit Width
            </button>
            <button
              onClick={onFitPage}
              className={`w-full px-3 py-1 text-xs text-left hover:bg-zinc-700 transition-colors ${
                zoomMode === "fit-page" ? "text-brand font-semibold" : "text-zinc-300"
              }`}
            >
              Fit Page
            </button>
          </div>
        </div>

        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="size-4" />
        </button>

        <div className="h-4 w-px bg-zinc-700 mx-1" />

        <button
          onClick={onFitWidth}
          className={`p-1.5 rounded-md transition-colors ${
            zoomMode === "fit-width" ? "bg-zinc-700 text-brand" : "hover:bg-zinc-800"
          }`}
          aria-label="Fit to width"
          title="Fit to width"
        >
          <Columns2 className="size-4" />
        </button>

        <button
          onClick={onFitPage}
          className={`p-1.5 rounded-md transition-colors ${
            zoomMode === "fit-page" ? "bg-zinc-700 text-brand" : "hover:bg-zinc-800"
          }`}
          aria-label="Fit to page"
          title="Fit to page"
        >
          <Maximize className="size-4" />
        </button>

        <button
          onClick={onResetZoom}
          className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          aria-label="Reset zoom to 100%"
          title="Reset zoom (100%)"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onDownload}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-brand text-black hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          <Download className="size-3.5" />
          {isExporting ? "Exporting…" : "PDF"}
        </button>

        <button
          onClick={onPrint}
          className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          aria-label="Print"
        >
          <Printer className="size-4" />
        </button>
      </div>
    </div>
  )
}
