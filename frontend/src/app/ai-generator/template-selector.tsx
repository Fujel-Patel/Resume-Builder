"use client"

import { useState, useMemo } from "react"
import { Check, FileText, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { builderTemplates } from "@/features/resume-builder/preview/templates"
import type { ResumeTemplate } from "@/features/resume/types"

const CATEGORY_ORDER = ["ats", "professional", "two-column", "creative"] as const
const CATEGORY_LABELS: Record<string, string> = {
  ats: "ATS Friendly",
  professional: "Professional",
  "two-column": "Two Column",
  creative: "Creative",
  "": "Other",
}

export function TemplateSelector({
  selected,
  onSelect,
  label,
}: {
  selected: ResumeTemplate
  onSelect: (t: ResumeTemplate) => void
  label?: string
}) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const cats = new Map<string, typeof builderTemplates>()
    for (const t of builderTemplates) {
      const cat = t.category || ""
      if (!cats.has(cat)) cats.set(cat, [])
      cats.get(cat)!.push(t)
    }
    return cats
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return builderTemplates.filter((t) => {
      if (activeCategory && (t.category || "") !== activeCategory) return false
      if (q) {
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [search, activeCategory])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof builderTemplates>()
    for (const t of filtered) {
      const cat = t.category || ""
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(t)
    }
    return map
  }, [filtered])

  return (
    <div>
      {label && <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full rounded-lg border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Category tabs */}
      <div className="mb-3 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
            activeCategory === null
              ? "bg-brand/10 text-brand"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          All ({builderTemplates.length})
        </button>
        {CATEGORY_ORDER.map((cat) => {
          const count = categories.get(cat)?.length || 0
          if (!count) return null
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                activeCategory === cat
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {CATEGORY_LABELS[cat] || cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Template list */}
      <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
        {Array.from(grouped.entries()).map(([cat, templates]) => (
          <div key={cat}>
            {grouped.size > 1 && (
              <p className="mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 first:mt-0">
                {CATEGORY_LABELS[cat] || cat}
              </p>
            )}
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg border bg-card p-2.5 text-left transition-colors hover:border-foreground/20",
                  selected === t.id && "border-brand/50 ring-1 ring-brand/20"
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    selected === t.id ? "bg-brand/10" : "bg-muted"
                  )}
                >
                  <FileText
                    className={cn(
                      "size-3.5",
                      selected === t.id ? "text-brand" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t.description}</p>
                </div>
                {selected === t.id && <Check className="size-3.5 shrink-0 text-brand" />}
              </button>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">No templates found</p>
        )}
      </div>
    </div>
  )
}
