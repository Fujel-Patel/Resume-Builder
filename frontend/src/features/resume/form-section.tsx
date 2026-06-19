"use client"

import { useState } from "react"
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react"

type FormSectionProps = {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  actions?: React.ReactNode
  onAISuggest?: () => void
  aiLoading?: boolean
}

export function FormSection({ title, defaultOpen = false, children, actions, onAISuggest, aiLoading }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-card border bg-card">
      <div className="flex items-stretch rounded-t-card">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/30 transition-colors rounded-tl-card"
        >
          <span>{title}</span>
          {open ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
        </button>
        {onAISuggest && (
          <button
            type="button"
            onClick={() => { if (!aiLoading) onAISuggest() }}
            disabled={aiLoading}
            className="flex items-center justify-center px-3 text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors rounded-tr-card shrink-0"
            aria-label="AI Improve"
          >
            {aiLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          </button>
        )}
      </div>
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
