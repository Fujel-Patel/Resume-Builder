"use client"

import { useState, useDeferredValue } from "react"
import { EditorPanel } from "./editor/editor-panel"
import { PreviewCanvas } from "./preview/preview-canvas"
import { ThemeEditor } from "./editor/theme-editor"
import { TemplateSelector } from "./editor/template-selector"
import { useResumeStore } from "@/store/resume-store"
import { Button } from "@/components/ui/button"
import { Download, Eye, Loader2, PenLine, Palette, Settings } from "lucide-react"
import { exportResumeAsPdf } from "@/lib/api/pdf-export"

export function BuilderLayout() {
  const resume = useResumeStore((s) => s.resume)
  const deferredResume = useDeferredValue(resume)
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor")
  const [showTheme, setShowTheme] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    const resumeId = resume.id
    if (!resumeId) {
      console.warn("No resume ID — cannot export")
      return
    }
    setIsExporting(true)
    try {
      await exportResumeAsPdf(resumeId, resume.templateId)
    } catch (err) {
      console.error("PDF export failed:", err)
      // TODO: show toast notification
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col print:h-auto print:overflow-visible">
      {/* Top bar */}
      <div className="no-print flex items-center justify-between border-b bg-card px-4 py-2 lg:px-6 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">{resume.name || "Resume Builder"}</h2>
        </div>
        <div className="flex items-center gap-2">
          <TemplateSelector />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTheme(!showTheme)}
          >
            <Palette className="size-3.5" />
            Theme
          </Button>
          <Button variant="brand" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            {isExporting ? "Exporting…" : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="no-print flex lg:hidden border-b bg-card shrink-0">
        <button
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${mobileTab === "editor" ? "border-b-2 border-brand text-brand" : "text-muted-foreground"}`}
        >
          <PenLine className="inline size-3.5 mr-1" /> Editor
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${mobileTab === "preview" ? "border-b-2 border-brand text-brand" : "text-muted-foreground"}`}
        >
          <Eye className="inline size-3.5 mr-1" /> Preview
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        {/* Editor panel */}
        <div className={`no-print w-full lg:w-[45%] overflow-y-auto border-r ${mobileTab === "preview" ? "hidden lg:block" : ""}`}>
          <div className="p-4 lg:p-6">
            {showTheme ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowTheme(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  &larr; Back to Editor
                </button>
                <ThemeEditor />
              </div>
            ) : (
              <EditorPanel />
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className={`print-only w-full lg:w-[55%] overflow-y-auto bg-muted/30 ${mobileTab === "editor" ? "hidden lg:block" : ""}`}>
          <PreviewCanvas resume={deferredResume} scale={0.6} />
        </div>
      </div>
    </div>
  )
}
