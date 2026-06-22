"use client"

import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { Plus, Trash2 } from "lucide-react"

type ReferencesEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function ReferencesEditor(props: ReferencesEditorProps) {
  const items = useResumeStore((s) => s.resume.content.references)
  const add = useResumeStore((s) => s.addReference)
  const update = useResumeStore((s) => s.updateReference)
  const remove = useResumeStore((s) => s.removeReference)

  return (
    <SectionHeader title={`References (${items.length})`} {...props}>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border bg-background p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} placeholder="Full name" className="field-input text-xs" />
                  <input value={item.role} onChange={(e) => update(item.id, { role: e.target.value })} placeholder="Job title" className="field-input text-xs" />
                </div>
                <input value={item.company} onChange={(e) => update(item.id, { company: e.target.value })} placeholder="Company" className="field-input text-xs w-full" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="email" value={item.email} onChange={(e) => update(item.id, { email: e.target.value })} placeholder="Email" className="field-input text-xs" />
                  <input type="tel" value={item.phone} onChange={(e) => update(item.id, { phone: e.target.value })} placeholder="Phone" className="field-input text-xs" />
                </div>
              </div>
              <button type="button" onClick={() => remove(item.id)} className="p-1 ml-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={add} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"><Plus className="size-3.5" /> Add Reference</button>
      </div>
    </SectionHeader>
  )
}
