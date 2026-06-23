"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { templateMap } from "@/features/resume-builder/preview/templates"
import { sampleResumeData } from "./sampleResumeData"

type Props = {
  templateId: string
  onClose: () => void
}

export function PreviewLightbox({ templateId, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const Template = templateMap[templateId]
  if (!Template) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{
          width: "80vw",
          maxWidth: 1200,
          height: "90vh",
          maxHeight: 1000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b px-5 py-3">
          <p className="text-sm font-medium text-foreground">Template Preview</p>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Scrollable preview */}
        <div className="flex-1 overflow-y-auto bg-muted/30 p-8">
          <div
            className="mx-auto bg-white shadow-sm"
            style={{
              width: 794,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Template resume={sampleResumeData} />
          </div>
        </div>
      </div>
    </div>
  )
}
