"use client"

import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"

type SummaryEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function SummaryEditor({
  sectionId: _sectionId,
  visible,
  onToggleVisibility,
  dragHandleProps,
}: SummaryEditorProps) {
  const summary = useResumeStore((s) => s.resume.content.summary)
  const setSummary = useResumeStore((s) => s.setSummary)

  return (
    <SectionHeader
      title="Professional Summary"
      visible={visible}
      onToggleVisibility={onToggleVisibility}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground">
          Summary <span className="text-muted-foreground font-normal">({summary.length}/500)</span>
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief professional summary highlighting your key qualifications..."
          className="field-textarea"
          rows={4}
          maxLength={1000}
        />
      </div>
    </SectionHeader>
  )
}
