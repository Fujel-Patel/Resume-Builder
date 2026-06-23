"use client"

import React, { useRef, useLayoutEffect, useState } from "react"
import { templateMap } from "@/features/resume-builder/preview/templates"
import { sampleResumeData } from "./sampleResumeData"

type Props = {
  templateId: string
  height?: number
  onClick?: () => void
}

function TemplatePreviewInner({ templateId, height = 420, onClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      const scaleX = width / 794
      const scaleY = height / 1123
      setScale(Math.min(scaleX, scaleY, 1))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [height])

  const Template = templateMap[templateId]
  if (!Template) return null

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center overflow-hidden rounded-t-xl bg-white"
      style={{ height, cursor: onClick ? "pointer" : undefined }}
      onClick={onClick}
    >
      <div
        className="shrink-0 origin-center"
        style={{
          width: 794,
          height: 1123,
          transform: `scale(${scale})`,
          boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
        }}
      >
        <Template resume={sampleResumeData} />
      </div>
    </div>
  )
}

export const TemplatePreview = React.memo(TemplatePreviewInner)
