"use client"

import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { Plus, Trash2 } from "lucide-react"

type EducationEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function EducationEditor({
  sectionId: _sectionId,
  visible,
  onToggleVisibility,
  dragHandleProps,
}: EducationEditorProps) {
  const education = useResumeStore((s) => s.resume.content.education)
  const addEducation = useResumeStore((s) => s.addEducation)
  const updateEducation = useResumeStore((s) => s.updateEducation)
  const removeEducation = useResumeStore((s) => s.removeEducation)

  return (
    <SectionHeader
      title={`Education (${education.length})`}
      visible={visible}
      onToggleVisibility={onToggleVisibility}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-3">
        {education.map((edu, index) => (
          <div key={edu.id} className="rounded-lg border bg-background p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
              <button
                type="button"
                onClick={() => removeEducation(edu.id)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-muted-foreground">Institution *</label>
                <input
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                  placeholder="School or university"
                  className="field-input text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-muted-foreground">Degree *</label>
                <input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                  placeholder="B.S., M.A., Ph.D."
                  className="field-input text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-muted-foreground">Field of Study</label>
              <input
                value={edu.field}
                onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                placeholder="Computer Science, Business, etc."
                className="field-input text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-muted-foreground">Start Date</label>
                <input
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                  placeholder="2016"
                  className="field-input text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-muted-foreground">End Date</label>
                <div className="flex items-center gap-1">
                  <input
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                    placeholder="2020"
                    className="field-input text-xs flex-1"
                    disabled={edu.current}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-muted-foreground">GPA</label>
                <input
                  value={edu.gpa}
                  onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                  placeholder="3.8"
                  className="field-input text-xs"
                />
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <input
                type="checkbox"
                checked={edu.current}
                onChange={(e) => updateEducation(edu.id, { current: e.target.checked })}
                className="rounded border-border"
              />
              Currently enrolled
            </label>
          </div>
        ))}

        <button
          type="button"
          onClick={addEducation}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
        >
          <Plus className="size-3.5" /> Add Education
        </button>
      </div>
    </SectionHeader>
  )
}
