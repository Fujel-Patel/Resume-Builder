"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { ZoomMode } from "../engine/constants"
import { ZOOM_LEVELS, A4 } from "../engine/constants"

export function useViewerZoom(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fit-width")
  const [zoomPercent, setZoomPercent] = useState(100)
  const containerSizeRef = useRef({ width: 0, height: 0 })

  const getScale = useCallback((): number => {
    if (zoomMode === "fit-width") {
      const cw = containerSizeRef.current.width
      if (cw <= 0) return 1
      return Math.min((cw - 48) / A4.WIDTH_PX, 2)
    }
    if (zoomMode === "fit-page") {
      const ch = containerSizeRef.current.height
      const cw = containerSizeRef.current.width
      if (ch <= 0 || cw <= 0) return 1
      const scaleW = (cw - 48) / A4.WIDTH_PX
      const scaleH = (ch - 48) / A4.HEIGHT_PX
      return Math.min(scaleW, scaleH, 2)
    }
    return zoomMode / 100
  }, [zoomMode])

  const zoomIn = useCallback(() => {
    setZoomMode((prev) => {
      if (prev === "fit-width" || prev === "fit-page") return 100
      const idx = ZOOM_LEVELS.indexOf(prev as (typeof ZOOM_LEVELS)[number])
      if (idx < ZOOM_LEVELS.length - 1) return ZOOM_LEVELS[idx + 1]
      return prev
    })
  }, [])

  const zoomOut = useCallback(() => {
    setZoomMode((prev) => {
      if (prev === "fit-width" || prev === "fit-page") return 100
      const idx = ZOOM_LEVELS.indexOf(prev as (typeof ZOOM_LEVELS)[number])
      if (idx > 0) return ZOOM_LEVELS[idx - 1]
      return prev
    })
  }, [])

  const fitWidth = useCallback(() => setZoomMode("fit-width"), [])
  const fitPage = useCallback(() => setZoomMode("fit-page"), [])
  const resetZoom = useCallback(() => setZoomMode(100), [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerSizeRef.current = {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        }
      }
    })
    observer.observe(container)
    containerSizeRef.current = {
      width: container.clientWidth,
      height: container.clientHeight,
    }
    return () => observer.disconnect()
  }, [containerRef])

  useEffect(() => {
    if (typeof zoomMode === "number") {
      setZoomPercent(zoomMode)
    }
  }, [zoomMode])

  const scale = getScale()

  return {
    zoomMode,
    zoomPercent,
    scale,
    zoomIn,
    zoomOut,
    fitWidth,
    fitPage,
    resetZoom,
  }
}
