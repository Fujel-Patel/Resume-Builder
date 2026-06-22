"use client"

import { GripVertical, Eye, EyeOff, ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  title: string
  visible: boolean
  onToggleVisibility: () => void
  onRemove?: () => void
  dragHandleProps?: Record<string, unknown>
  defaultOpen?: boolean
  children: ReactNode
}

export function SectionHeader({
  title,
  visible,
  onToggleVisibility,
  onRemove,
  dragHandleProps,
  defaultOpen = true,
  children,
}: SectionHeaderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-3 select-none",
          "border-b border-border/50"
        )}
      >
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="size-4" />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {isOpen ? (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              !visible && "text-muted-foreground line-through"
            )}
          >
            {title}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleVisibility}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            title={visible ? "Hide section" : "Show section"}
          >
            {visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </button>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
              title="Remove section"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}
