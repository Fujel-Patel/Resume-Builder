"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, LayoutTemplate, X, Sparkles, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useResumeStore } from "@/store/resume-store"
import { builderTemplates } from "../preview/templates"
import { TemplatePreview } from "@/features/resume/template-previews/TemplatePreview"
import { PreviewLightbox } from "@/features/resume/template-previews/PreviewLightbox"

const TAG_COLORS: Record<string, string> = {
  "ATS Friendly": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Modern: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Executive: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Creative: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Minimal: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
}

export function TemplateSelector() {
  const templateId = useResumeStore((s) => s.resume.templateId)
  const updateTemplateId = useResumeStore((s) => s.updateTemplateId)
  const [open, setOpen] = useState(false)
  const [lightboxId, setLightboxId] = useState<string | null>(null)

  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <LayoutTemplate className="size-3.5" />
        Template
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="flex flex-col p-0 gap-0"
          showCloseButton={false}
          style={{
            width: "95vw",
            maxWidth: 1600,
            height: "92vh",
            maxHeight: "95vh",
          }}
        >
          {/* Sticky header */}
          <div className="shrink-0 flex items-center justify-between border-b px-6 py-5">
            <div>
              <DialogTitle className="text-xl font-semibold">Choose Resume Template</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Select a professional layout for your resume
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={handleClose}>
              <X className="size-5" />
            </Button>
          </div>

          {/* Scrollable grid body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {builderTemplates.map((t) => {
                const selected = templateId === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      updateTemplateId(t.id)
                      setOpen(false)
                    }}
                    className={cn(
                      "group relative flex flex-col rounded-2xl border-2 text-left overflow-hidden transition-all duration-300",
                      selected
                        ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                        : "border-border hover:border-foreground/20 hover:shadow-lg hover:scale-[1.02]"
                    )}
                    style={{ height: 520 }}
                  >
                    {/* Selected indicator */}
                    {selected && (
                      <div className="absolute -top-2.5 -right-2.5 z-20 flex size-7 items-center justify-center rounded-full bg-brand text-white shadow-lg">
                        <Check className="size-4" />
                      </div>
                    )}

                    {/* Preview section (420px) */}
                    <div className="relative" style={{ height: 420 }}>
                      <TemplatePreview
                        templateId={t.id}
                        height={420}
                        onClick={() => setLightboxId(t.id)}
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                        <span className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-foreground shadow-lg pointer-events-auto">
                          Use Template
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>

                    {/* Footer section (100px) */}
                    <div className="shrink-0 flex flex-col justify-center gap-1.5 px-5" style={{ height: 100 }}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                      {t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {t.tags.map((tag) => (
                            <span
                              key={tag}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                TAG_COLORS[tag] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              )}
                            >
                              <Sparkles className="size-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox for larger preview */}
      {lightboxId && (
        <PreviewLightbox
          templateId={lightboxId}
          onClose={() => setLightboxId(null)}
        />
      )}
    </>
  )
}
