"use client"

import type { ResumeData } from "@/types/resume"
import { templateMap } from "./templates"
import { NovaTemplate } from "./templates/nova-template"

type PreviewCanvasProps = {
  resume: ResumeData
  scale?: number
  showPageShadow?: boolean
}

export function PreviewCanvas({
  resume,
  scale = 0.7,
  showPageShadow = true,
}: PreviewCanvasProps) {
  const TemplateComponent = templateMap[resume.templateId] || NovaTemplate

  return (
    <>
      {/* Screen preview — scaled down */}
      <div className="print:hidden flex flex-col items-center py-8">
        <div
          className="print:shadow-none"
          style={{
            width: `${210 * scale}mm`,
            transformOrigin: "top center",
            boxShadow: showPageShadow
              ? "0 2px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)"
              : "none",
            borderRadius: "2px",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: "210mm",
            }}
          >
            <TemplateComponent resume={resume} />
          </div>
        </div>
      </div>

      {/* Print-only version — full A4 size, hidden on screen */}
      <div className="print-preview hidden print:block print:bg-white print:overflow-visible"
        style={{ width: "210mm", margin: "0 auto" }}>
        <TemplateComponent resume={resume} />
      </div>
    </>
  )
}
