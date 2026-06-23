"use client"

import { useState, useCallback } from "react"
import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { suggestSummaryApi } from "@/lib/api/ai-suggest"

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
  const content = useResumeStore((s) => s.resume.content)
  const [aiLoading, setAiLoading] = useState(false)

  const handleImproveSummary = useCallback(async () => {
    setAiLoading(true)
    try {
      const experience = content.experience.map((e) => e.bullets.join("\n")).filter(Boolean)
      const allSkills = content.skills.flatMap((g) => g.skills)
      const result = await suggestSummaryApi({
        job_title: content.contact.title || "",
        skills: allSkills.length > 0 ? allSkills : [""],
        experience: experience.length > 0 ? experience : [""],
        job_description: content.jobDescription || "",
        current_summary: summary || null,
      })
      setSummary(result.summary)
    } catch {
    } finally {
      setAiLoading(false)
    }
  }, [content, summary, setSummary])

  return (
    <SectionHeader
      title="Professional Summary"
      visible={visible}
      onToggleVisibility={onToggleVisibility}
      dragHandleProps={dragHandleProps}
      onAISuggest={handleImproveSummary}
      aiLoading={aiLoading}
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
