"use client"

import { useState, useCallback } from "react"
import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { Plus, Trash2, X } from "lucide-react"
import { suggestSkillsApi } from "@/lib/api/ai-suggest"

type SkillsEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function SkillsEditor({
  sectionId: _sectionId,
  visible,
  onToggleVisibility,
  dragHandleProps,
}: SkillsEditorProps) {
  const skills = useResumeStore((s) => s.resume.content.skills)
  const jobDescription = useResumeStore((s) => s.resume.content.jobDescription)
  const addSkillGroup = useResumeStore((s) => s.addSkillGroup)
  const updateSkillGroup = useResumeStore((s) => s.updateSkillGroup)
  const removeSkillGroup = useResumeStore((s) => s.removeSkillGroup)
  const addSkillToGroup = useResumeStore((s) => s.addSkillToGroup)
  const removeSkillFromGroup = useResumeStore((s) => s.removeSkillFromGroup)
  const setSkills = useResumeStore((s) => s.setSkills)
  const [aiLoading, setAiLoading] = useState(false)

  const handleSuggestSkills = useCallback(async () => {
    setAiLoading(true)
    try {
      const currentSkills: Record<string, string[]> = {}
      for (const g of skills) {
        const key = g.name.toLowerCase().replace(/\s+/g, "_") || "other"
        currentSkills[key] = g.skills
      }
      const result = await suggestSkillsApi({
        job_description: jobDescription || "",
        current_skills: Object.keys(currentSkills).length > 0 ? currentSkills : { other: [] },
      })
      const newGroups: { name: string; skills: string[] }[] = Object.entries(result.skills).map(([key, skillList]) => ({
        name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        skills: skillList,
      }))
      setSkills(
        newGroups.map((g) => ({
          id: `skill_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          ...g,
        }))
      )
    } catch {
    } finally {
      setAiLoading(false)
    }
  }, [skills, jobDescription, setSkills])

  const [newSkillInput, setNewSkillInput] = useState<Record<string, string>>({})

  const handleAddSkill = (groupId: string) => {
    const skill = newSkillInput[groupId]?.trim()
    if (skill) {
      addSkillToGroup(groupId, skill)
      setNewSkillInput((prev) => ({ ...prev, [groupId]: "" }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, groupId: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSkill(groupId)
    }
  }

  return (
    <SectionHeader
      title={`Skills (${skills.reduce((acc, g) => acc + g.skills.length, 0)})`}
      visible={visible}
      onToggleVisibility={onToggleVisibility}
      dragHandleProps={dragHandleProps}
      onAISuggest={handleSuggestSkills}
      aiLoading={aiLoading}
    >
      <div className="space-y-3">
        {skills.map((group, index) => (
          <div key={group.id} className="rounded-lg border bg-background p-3 space-y-2">
            <div className="flex items-center justify-between">
              <input
                value={group.name}
                onChange={(e) => updateSkillGroup(group.id, { name: e.target.value })}
                placeholder={index === 0 ? "e.g. Frontend, Backend, Tools" : "Group name"}
                className="field-input text-xs flex-1 mr-2"
              />
              <button
                type="button"
                onClick={() => removeSkillGroup(group.id)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {group.skills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkillFromGroup(group.id, i)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <input
                value={newSkillInput[group.id] || ""}
                onChange={(e) => setNewSkillInput((prev) => ({ ...prev, [group.id]: e.target.value }))}
                onKeyDown={(e) => handleKeyDown(e, group.id)}
                placeholder="Type a skill and press Enter..."
                className="field-input text-xs flex-1"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(group.id)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSkillGroup}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
        >
          <Plus className="size-3.5" /> Add Skill Group
        </button>
      </div>
    </SectionHeader>
  )
}
