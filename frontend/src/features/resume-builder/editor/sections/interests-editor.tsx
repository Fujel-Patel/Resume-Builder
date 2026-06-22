"use client"

import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { Plus, Trash2 } from "lucide-react"

type InterestsEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function InterestsEditor(props: InterestsEditorProps) {
  const items = useResumeStore((s) => s.resume.content.interests)
  const add = useResumeStore((s) => s.addInterest)
  const update = useResumeStore((s) => s.updateInterest)
  const remove = useResumeStore((s) => s.removeInterest)

  return (
    <SectionHeader title={`Interests (${items.length})`} {...props}>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2 rounded-lg border bg-background p-2.5">
            <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
            <input value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} placeholder="Interest" className="field-input text-xs flex-1" />
            <button type="button" onClick={() => remove(item.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
          </div>
        ))}
        <button type="button" onClick={add} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"><Plus className="size-3.5" /> Add Interest</button>
      </div>
    </SectionHeader>
  )
}
