"use client"

import { ResumePreview } from "@/features/resume/resume-preview"
import { TemplateSwitcher } from "@/features/resume/template-switcher"
import { Button } from "@/components/ui/button"
import { Sparkles, Download } from "lucide-react"
import type { ResumeData } from "@/features/resume/types"

type PreviewPanelProps = {
  data: ResumeData
  template: "classic" | "modern" | "minimal"
  onTemplateChange: (t: "classic" | "modern" | "minimal") => void
}

export function PreviewPanel({ data, template, onTemplateChange }: PreviewPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <TemplateSwitcher active={template} onChange={onTemplateChange} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-3.5" />
            PDF
          </Button>
          <Button variant="brand" size="sm">
            <Sparkles className="size-3.5" />
            Optimize
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#0A0A0A] p-6">
        <div className="mx-auto max-w-[210mm]">
          <ResumePreview data={data} template={template} />
        </div>
      </div>
    </div>
  )
}
