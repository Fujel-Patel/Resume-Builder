"use client"

import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { FileUpload } from "@/components/ui/file-upload"
import { cn } from "@/lib/utils"
import { Check, X, Search, AlertCircle } from "lucide-react"
import { TemplateSelector } from "./template-selector"
import type { ResumeTemplate } from "@/features/resume/types"

export function JobInputStep({
  jobDesc,
  setJobDesc,
  file,
  setFile,
  template,
  setTemplate,
  scannedWarning,
}: {
  jobDesc: string
  setJobDesc: (v: string) => void
  file: File | null
  setFile: (f: File | null) => void
  template: ResumeTemplate
  setTemplate: (t: ResumeTemplate) => void
  scannedWarning: boolean
}) {

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Paste job description & upload resume</h2>
          <p className="text-sm text-muted-foreground">Provide both to get the best AI-optimized resume tailored for this role.</p>
        </div>
        <EnhancedCard>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            rows={8}
            className="w-full resize-none rounded-lg border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste the full job description here... Include required skills, qualifications, and responsibilities."
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{jobDesc.length} characters</p>
            <Button variant="brandOutline" size="sm">
              <Search className="size-3.5" />
              Suggest Keywords
            </Button>
          </div>
        </EnhancedCard>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            {file ? (
              <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Check className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">Ready for analysis</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove file">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <FileUpload onFile={(f) => setFile(f)} />
            )}
          </div>
          {scannedWarning && (
            <div className="lg:col-span-2 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-500" />
              <p className="text-xs text-muted-foreground">
                This PDF appears to be image-based (scanned). OCR processing will be attempted, but results may vary. For best results, use a text-based PDF or DOCX.
              </p>
            </div>
          )}
          <TemplateSelector selected={template} onSelect={setTemplate} label="Template" />
        </div>
      </div>
    </>
  )
}
