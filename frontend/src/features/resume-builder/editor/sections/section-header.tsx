"use client"

import { GripVertical, Eye, EyeOff, ChevronDown, ChevronRight, Trash2, Sparkles, Loader2, AlertCircle, Settings } from "lucide-react"
import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAiConfig } from "@/hooks/use-ai-config"

type SectionHeaderProps = {
  title: string
  visible: boolean
  onToggleVisibility: () => void
  onRemove?: () => void
  dragHandleProps?: Record<string, unknown>
  defaultOpen?: boolean
  onAISuggest?: () => void
  aiLoading?: boolean
  children: ReactNode
}

export function SectionHeader({
  title,
  visible,
  onToggleVisibility,
  onRemove,
  dragHandleProps,
  defaultOpen = true,
  onAISuggest,
  aiLoading,
  children,
}: SectionHeaderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [showAiBanner, setShowAiBanner] = useState(false)
  const { isConfigured, loading: aiConfigLoading } = useAiConfig()
  const router = useRouter()

  const handleAIClick = () => {
    if (aiLoading || aiConfigLoading) return
    if (!isConfigured) {
      setShowAiBanner((v) => !v)
      return
    }
    onAISuggest?.()
  }

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
          {onAISuggest && (
            <button
              type="button"
              onClick={handleAIClick}
              disabled={aiLoading}
              className={cn(
                "p-1 transition-colors rounded-md",
                aiConfigLoading || isConfigured
                  ? "text-muted-foreground hover:text-brand hover:bg-brand/10"
                  : "text-muted-foreground/50 hover:text-amber-500 hover:bg-amber-500/10"
              )}
              title={aiConfigLoading || isConfigured ? "AI suggest" : "AI not configured"}
            >
              {aiLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            </button>
          )}

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

      {showAiBanner && !aiConfigLoading && !isConfigured && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/5 border-b border-amber-500/20">
          <AlertCircle className="size-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-600 flex-1">
            AI features require an API key. Configure an AI provider to enable smart suggestions.
          </p>
          <button
            type="button"
            onClick={() => router.push("/settings/ai")}
            className="flex items-center gap-1.5 shrink-0 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 hover:bg-amber-500/20 transition-colors"
          >
            <Settings className="size-3" />
            Configure
          </button>
        </div>
      )}

      {isOpen && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}
