"use client"

import { useState, useCallback } from "react"
import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { Plus, Trash2, X } from "lucide-react"
import { suggestProjectsApi } from "@/lib/api/ai-suggest"

type ProjectsEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function ProjectsEditor({
  sectionId: _sectionId,
  visible,
  onToggleVisibility,
  dragHandleProps,
}: ProjectsEditorProps) {
  const projects = useResumeStore((s) => s.resume.content.projects)
  const jobDescription = useResumeStore((s) => s.resume.content.jobDescription)
  const skills = useResumeStore((s) => s.resume.content.skills)
  const addProject = useResumeStore((s) => s.addProject)
  const updateProject = useResumeStore((s) => s.updateProject)
  const removeProject = useResumeStore((s) => s.removeProject)
  const addBullet = useResumeStore((s) => s.addBullet)
  const updateBullet = useResumeStore((s) => s.updateBullet)
  const removeBullet = useResumeStore((s) => s.removeBullet)
  const [aiLoading, setAiLoading] = useState(false)

  const handleImproveProjects = useCallback(async () => {
    const allBullets = projects.flatMap((p) => p.bullets).filter(Boolean)
    if (allBullets.length === 0) return
    setAiLoading(true)
    try {
      const first = projects[0]
      const techNames = skills.flatMap((g) => g.skills)
      const result = await suggestProjectsApi({
        project_descriptions: allBullets,
        project_name: first.name || null,
        tech_stack: techNames.length > 0 ? techNames : null,
        job_description: jobDescription || null,
      })
      if (result.projects.length === allBullets.length) {
        let bi = 0
        for (const proj of projects) {
          const projBullets = result.projects.slice(bi, bi + proj.bullets.length)
          updateProject(proj.id, { bullets: projBullets })
          bi += proj.bullets.length
        }
      }
    } catch {
    } finally {
      setAiLoading(false)
    }
  }, [projects, jobDescription, skills, updateProject])

  return (
    <SectionHeader
      title={`Projects (${projects.length})`}
      visible={visible}
      onToggleVisibility={onToggleVisibility}
      dragHandleProps={dragHandleProps}
      onAISuggest={handleImproveProjects}
      aiLoading={aiLoading}
    >
      <div className="space-y-3">
        {projects.map((proj) => (
          <div key={proj.id} className="rounded-lg border bg-background p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                    placeholder="Project name"
                    className="field-input text-xs"
                  />
                  <input
                    value={proj.role}
                    onChange={(e) => updateProject(proj.id, { role: e.target.value })}
                    placeholder="Your role"
                    className="field-input text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={proj.startDate}
                    onChange={(e) => updateProject(proj.id, { startDate: e.target.value })}
                    placeholder="Start date"
                    className="field-input text-xs"
                  />
                  <input
                    value={proj.endDate}
                    onChange={(e) => updateProject(proj.id, { endDate: e.target.value })}
                    placeholder="End date"
                    className="field-input text-xs"
                  />
                </div>
                <input
                  value={proj.url}
                  onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="field-input text-xs w-full"
                />
                <div className="space-y-1">
                  {proj.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="text-muted-foreground mt-1.5 text-[10px]">&#8226;</span>
                      <input
                        value={bullet}
                        onChange={(e) => updateBullet("projects", proj.id, i, e.target.value)}
                        placeholder="Describe your contribution..."
                        className="field-input text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeBullet("projects", proj.id, i)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addBullet("projects", proj.id)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-3" /> Add bullet point
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeProject(proj.id)}
                className="p-1 ml-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addProject}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
        >
          <Plus className="size-3.5" /> Add Project
        </button>
      </div>
    </SectionHeader>
  )
}
