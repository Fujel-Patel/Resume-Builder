"use client"

import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { Plus, Trash2 } from "lucide-react"

type LanguagesEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

const PROFICIENCIES = [
  { label: "Native", value: "native" },
  { label: "Fluent", value: "fluent" },
  { label: "Advanced", value: "advanced" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Basic", value: "basic" },
] as const

export function LanguagesEditor({
  sectionId: _sectionId,
  visible,
  onToggleVisibility,
  dragHandleProps,
}: LanguagesEditorProps) {
  const languages = useResumeStore((s) => s.resume.content.languages)
  const addLanguage = useResumeStore((s) => s.addLanguage)
  const updateLanguage = useResumeStore((s) => s.updateLanguage)
  const removeLanguage = useResumeStore((s) => s.removeLanguage)

  return (
    <SectionHeader
      title={`Languages (${languages.length})`}
      visible={visible}
      onToggleVisibility={onToggleVisibility}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-2">
        {languages.map((lang, index) => (
          <div key={lang.id} className="flex items-center gap-2 rounded-lg border bg-background p-2.5">
            <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
            <input
              value={lang.name}
              onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
              placeholder="Language"
              className="field-input text-xs flex-1"
            />
            <select
              value={lang.proficiency}
              onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value as typeof lang.proficiency })}
              className="field-input text-xs w-28"
            >
              {PROFICIENCIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeLanguage(lang.id)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addLanguage}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
        >
          <Plus className="size-3.5" /> Add Language
        </button>
      </div>
    </SectionHeader>
  )
}
