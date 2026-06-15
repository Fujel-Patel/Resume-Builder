"use client"

import { cn } from "@/lib/utils"

type Template = "classic" | "modern" | "minimal"

const templates: { id: Template; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
]

type TemplateSwitcherProps = {
  active: Template
  onChange: (t: Template) => void
}

export function TemplateSwitcher({ active, onChange }: TemplateSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
            active === t.id
              ? "border-brand bg-brand/10 text-brand"
              : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
          )}
        >
          <div
            className={cn(
              "size-3 rounded-[2px] border",
              active === t.id ? "border-brand bg-brand/30" : "border-border bg-muted"
            )}
          />
          {t.label}
        </button>
      ))}
    </div>
  )
}
