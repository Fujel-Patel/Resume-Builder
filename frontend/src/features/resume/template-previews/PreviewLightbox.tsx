"use client"

import { useEffect, useMemo } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { builderTemplates, templateMap } from "@/features/resume-builder/preview/templates"
import { sampleResumeData } from "./sampleResumeData"
import { useResumeStore } from "@/store/resume-store"

type Props = {
  templateId: string
  onClose: () => void
}

const DEFAULT_FEATURES = [
  "A4 / US-Letter Size",
  "Editable Text",
  "Fully customizable",
  "Print ready format",
  "Online resume with shareable link",
]

export function PreviewLightbox({ templateId, onClose }: Props) {
  const updateTemplateId = useResumeStore((s) => s.updateTemplateId)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const Template = templateMap[templateId]
  const meta = useMemo(
    () => builderTemplates.find((t) => t.id === templateId),
    [templateId],
  )

  if (!Template) return null

  const handleUse = () => {
    updateTemplateId(templateId)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex w-full overflow-hidden rounded-2xl bg-background shadow-2xl"
        style={{
          maxWidth: 1100,
          height: "min(90vh, 920px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 flex size-8 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close preview"
        >
          <X className="size-4" />
        </button>

        {/* Left: live resume preview */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto bg-muted/40 p-6 sm:p-8">
          <div
            className="shrink-0 overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5"
            style={{
              width: 420,
              height: Math.round(1123 * (420 / 794)),
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                width: 794,
                height: 1123,
                transform: `scale(${420 / 794})`,
                transformOrigin: "top left",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Template resume={sampleResumeData} />
            </div>
          </div>
        </div>

        {/* Right: template details + Use this template */}
        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-border bg-card p-8 sm:flex md:w-[380px]">
          <div className="flex flex-1 flex-col">
            <h2
              className="text-[28px] font-semibold tracking-wide text-foreground"
              style={{ letterSpacing: "0.04em" }}
            >
              {(meta?.name ?? templateId).toUpperCase()}
            </h2>
            <div className="mt-4 h-px w-full bg-border" />

            <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
              {meta?.description ||
                "A carefully crafted resume layout that makes designing your CV an absolute breeze."}
            </p>

            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Each template has been crafted with care to make designing your
              resume an absolute breeze for you.
            </p>

            <ul className="mt-8 space-y-2.5 text-[15px] text-foreground/90">
              {DEFAULT_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/70" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {meta?.tags && meta.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleUse}
            className="mt-8 h-11 w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
            size="lg"
          >
            Use this template
          </Button>
        </aside>

        {/* Mobile: sticky Use button */}
        <div className="absolute inset-x-0 bottom-0 flex border-t border-border bg-card p-4 sm:hidden">
          <Button
            type="button"
            onClick={handleUse}
            className="h-11 w-full rounded-xl bg-foreground text-background hover:bg-foreground/90"
            size="lg"
          >
            Use this template
          </Button>
        </div>
      </div>
    </div>
  )
}
