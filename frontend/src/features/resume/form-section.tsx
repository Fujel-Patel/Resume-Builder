"use client"

import { useState } from "react"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"

type FormSectionProps = {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  actions?: React.ReactNode
}

export function FormSection({ title, defaultOpen = false, children, actions }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-card border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/30 transition-colors rounded-t-card"
      >
        <span>{title}</span>
        <div className="flex items-center gap-2">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation() }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") e.stopPropagation() }}
            className="flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
            aria-label="AI Improve"
          >
            <Sparkles className="size-3.5" />
          </span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="pb-4">
          <div className="px-4 space-y-3">{children}</div>
          {actions && (
            <div className="flex justify-end border-t px-4 pt-3 mt-3">
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
