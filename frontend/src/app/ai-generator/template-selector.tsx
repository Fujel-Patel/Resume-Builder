"use client"

import { Check, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ResumeTemplate } from "@/features/resume/types"

const TEMPLATES: { id: ResumeTemplate; label: string; desc: string }[] = [
  { id: "classic", label: "Classic", desc: "Traditional serif layout" },
  { id: "modern", label: "Modern", desc: "Dark navy header, clean sans" },
  { id: "minimal", label: "Minimal", desc: "Light, airy, compact" },
  { id: "creative", label: "Creative", desc: "Two-column with dark sidebar" },
]

export { TEMPLATES }

export function TemplateSelector({
  selected,
  onSelect,
  label,
}: {
  selected: ResumeTemplate
  onSelect: (t: ResumeTemplate) => void
  label?: string
}) {
  return (
    <div>
      {label && <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>}
      <div className="space-y-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-foreground/20",
              selected === t.id && "border-brand/50 ring-1 ring-brand/20"
            )}
          >
            <div className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              selected === t.id ? "bg-brand/10" : "bg-muted"
            )}>
              <FileText className={cn("size-4", selected === t.id ? "text-brand" : "text-muted-foreground")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{t.label}</p>
              <p className="text-[11px] text-muted-foreground">{t.desc}</p>
            </div>
            {selected === t.id && <Check className="size-3.5 text-brand" />}
          </button>
        ))}
      </div>
    </div>
  )
}
