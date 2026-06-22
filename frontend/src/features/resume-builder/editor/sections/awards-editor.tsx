"use client"

import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { Plus, Trash2 } from "lucide-react"

type AwardsEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function AwardsEditor(props: AwardsEditorProps) {
  const awards = useResumeStore((s) => s.resume.content.awards)
  const add = useResumeStore((s) => s.addAward)
  const update = useResumeStore((s) => s.updateAward)
  const remove = useResumeStore((s) => s.removeAward)

  return (
    <SectionHeader title={`Awards (${awards.length})`} {...props}>
      <div className="space-y-2">
        {awards.map((item) => (
          <div key={item.id} className="rounded-lg border bg-background p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} placeholder="Award name" className="field-input text-xs" />
                  <input value={item.issuer} onChange={(e) => update(item.id, { issuer: e.target.value })} placeholder="Issuing organization" className="field-input text-xs" />
                </div>
                <input value={item.date} onChange={(e) => update(item.id, { date: e.target.value })} placeholder="Date" className="field-input text-xs w-full" />
                <textarea value={item.description} onChange={(e) => update(item.id, { description: e.target.value })} placeholder="Brief description" className="field-textarea text-xs" rows={2} />
              </div>
              <button type="button" onClick={() => remove(item.id)} className="p-1 ml-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={add} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"><Plus className="size-3.5" /> Add Award</button>
      </div>
    </SectionHeader>
  )
}
