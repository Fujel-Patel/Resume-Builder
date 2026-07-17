"use client"

import { ResumePreview } from "@/features/resume/resume-preview"
import type { ResumeData, ResumeTemplate } from "@/features/resume/types"

type PreviewPanelProps = {
  data: ResumeData
  template: ResumeTemplate
}

export function PreviewPanel({ data, template }: PreviewPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto bg-[#0A0A0A] p-2 sm:p-6">
        <div className="mx-auto max-w-[210mm]">
          <ResumePreview data={data} template={template} />
        </div>
      </div>
    </div>
  )
}
