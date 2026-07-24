"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ResumePreview } from "@/features/resume/resume-preview"
import { builderTemplates } from "@/features/resume-builder/preview/templates"
import { Check, Download, Eye, RotateCcw } from "lucide-react"
import { TemplateSelector } from "./template-selector"
import type { ResumeTemplate, ResumeData } from "@/features/resume/types"

export function ExportStep({
  optimizedFrontend,
  template,
  setTemplate,
  resumeId,
  downloading,
  error,
  onStartOver,
  onDownloadPdf,
}: {
  optimizedFrontend: ResumeData
  template: ResumeTemplate
  setTemplate: (t: ResumeTemplate) => void
  resumeId: string | null
  downloading: boolean
  error: string | null
  onStartOver: () => void
  onDownloadPdf: () => void
}) {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Export your optimized resume</h2>
          <p className="text-sm text-muted-foreground">Choose a template and download your optimized resume.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1">
          <Check className="size-3.5 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-500">Resume saved</span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <TemplateSelector selected={template} onSelect={setTemplate} label="Choose Template" />

          <div className="space-y-2 pt-2">
            <Button variant="brand" className="w-full" onClick={onDownloadPdf} disabled={!resumeId || downloading}>
              <Download className="size-4" />
              {downloading ? "Downloading..." : "Download PDF"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => resumeId && router.push(`/resume/new?id=${resumeId}`)} disabled={!resumeId}>
              <Eye className="size-4" />
              Open in Builder
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={onStartOver}>
              <RotateCcw className="size-3.5" />
              Start Over
            </Button>
          </div>
        </div>

        <div className="min-h-0">
          <div className="sticky top-4 overflow-hidden rounded-lg border shadow-sm">
            <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Preview — {builderTemplates.find((t) => t.id === template)?.name || template}
              </p>
            </div>
            <div className="bg-[#0A0A0A] p-4" style={{ minHeight: 500 }}>
              <div className="mx-auto max-w-[210mm] scale-[0.7] origin-top">
                <ResumePreview data={optimizedFrontend} template={template} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
