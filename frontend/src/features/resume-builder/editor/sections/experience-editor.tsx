"use client"

import { useState, useCallback } from "react"
import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { Plus, Trash2, X } from "lucide-react"
import { suggestExperienceApi } from "@/lib/api/ai-suggest"

type ExperienceEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function ExperienceEditor({
  sectionId: _sectionId,
  visible,
  onToggleVisibility,
  dragHandleProps,
}: ExperienceEditorProps) {
  const experiences = useResumeStore((s) => s.resume.content.experience)
  const jobDescription = useResumeStore((s) => s.resume.content.jobDescription)
  const addExperience = useResumeStore((s) => s.addExperience)
  const updateExperience = useResumeStore((s) => s.updateExperience)
  const removeExperience = useResumeStore((s) => s.removeExperience)
  const addBullet = useResumeStore((s) => s.addBullet)
  const updateBullet = useResumeStore((s) => s.updateBullet)
  const removeBullet = useResumeStore((s) => s.removeBullet)
  const [aiLoading, setAiLoading] = useState(false)

  const handleImproveExperience = useCallback(async () => {
    const allBullets = experiences.flatMap((e) => e.bullets).filter(Boolean)
    if (allBullets.length === 0) return
    setAiLoading(true)
    try {
      const first = experiences[0]
      const result = await suggestExperienceApi({
        experience_bullets: allBullets,
        job_role: first.role || "",
        company: first.company || null,
        job_description: jobDescription || null,
      })
      if (result.bullets.length === allBullets.length) {
        let bi = 0
        for (const exp of experiences) {
          const expBullets = result.bullets.slice(bi, bi + exp.bullets.length)
          updateExperience(exp.id, { bullets: expBullets })
          bi += exp.bullets.length
        }
      }
    } catch {
    } finally {
      setAiLoading(false)
    }
  }, [experiences, jobDescription, updateExperience])

  return (
    <SectionHeader
      title={`Experience (${experiences.length})`}
      visible={visible}
      onToggleVisibility={onToggleVisibility}
      dragHandleProps={dragHandleProps}
      onAISuggest={handleImproveExperience}
      aiLoading={aiLoading}
    >
      <div className="space-y-3">
        {experiences.map((exp, index) => (
          <div key={exp.id} className="rounded-lg border bg-background p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeExperience(exp.id)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-muted-foreground">Company *</label>
                <input
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                  placeholder="Company name"
                  className="field-input text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-muted-foreground">Role *</label>
                <input
                  value={exp.role}
                  onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                  placeholder="Job title"
                  className="field-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-muted-foreground">Start Date</label>
                <input
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                  placeholder="Jan 2020"
                  className="field-input text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-muted-foreground">End Date</label>
                <div className="flex items-center gap-2">
                  <input
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                    placeholder="Present"
                    className="field-input text-xs flex-1"
                    disabled={exp.current}
                  />
                  <label className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? "" : exp.endDate })}
                      className="rounded border-border"
                    />
                    Current
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-muted-foreground">Location</label>
              <input
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                placeholder="City, State"
                className="field-input text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-muted-foreground">
                Bullet Points ({exp.bullets.length})
              </label>
              <div className="space-y-1">
                {exp.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-muted-foreground mt-1.5 text-[10px]">&#8226;</span>
                    <input
                      value={bullet}
                      onChange={(e) => updateBullet("experience", exp.id, i, e.target.value)}
                      placeholder="Describe an achievement or responsibility..."
                      className="field-input text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet("experience", exp.id, i)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addBullet("experience", exp.id)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                <Plus className="size-3" /> Add bullet point
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addExperience}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
        >
          <Plus className="size-3.5" /> Add Experience
        </button>
      </div>
    </SectionHeader>
  )
}
