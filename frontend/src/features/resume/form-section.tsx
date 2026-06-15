"use client"

import { useState } from "react"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"

type FormSectionProps = {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function FormSection({ title, defaultOpen = false, children }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-card border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/30 transition-colors rounded-t-card"
      >
        <span>{title}</span>
        <div className="flex items-center gap-2">
          <div
            onClick={(e) => { e.stopPropagation() }}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
            title="AI Improve"
          >
            <Sparkles className="size-3.5" />
          </div>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}
