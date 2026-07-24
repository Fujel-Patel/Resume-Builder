"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { useAiConfig } from "@/hooks/use-ai-config"
import { cn } from "@/lib/utils"
import {
  Sparkles, FileText, Check, ArrowRight, Lightbulb,
  RotateCcw, ArrowLeft, ChevronRight, Target, Eye, AlertCircle, Settings
} from "lucide-react"
import { type BackendResumeContent } from "@/lib/api/ai-suggest"
import { optimizeResumeStream } from "@/lib/api/ai-stream"
import { updateResumeApi } from "@/lib/api/resumes"
import { isScannedPdf } from "@/lib/pdf-check"
import { api } from "@/lib/api/client"
import type { ResumeTemplate } from "@/features/resume/types"
import { toFrontend } from "./ai-generator-utils"
import { JobInputStep } from "./job-input-step"
import { ProcessingStep } from "./processing-step"
import { CompareStep } from "./compare-step"
import { ExportStep } from "./export-step"

const STEPS = [
  { id: 1, label: "Job Description & Resume" },
  { id: 2, label: "AI Processing" },
  { id: 3, label: "Compare" },
  { id: 4, label: "Export" },
]

const tips: Record<number, string> = {
  1: "Paste a detailed job description and upload your resume. Both are needed for the best keyword matching results.",
  2: "Our AI is analyzing your resume against the job description. Optimization may take 10–30 seconds.",
  3: "Review the changes side-by-side. Green highlights show optimized content added by AI.",
  4: "Download your optimized resume in your preferred format. Your original is always preserved.",
}

export function AiGeneratorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isConfigured, loading: aiConfigLoading } = useAiConfig()
  const [ready, setReady] = useState(false)
  const [step, setStepState] = useState(1)
  const [maxCompleted, setMaxCompleted] = useState(1)
  const stepRef = useRef(step)

  const goToStep = useCallback((s: number) => {
    if (s >= 1 && s <= 4) {
      setStepState(s)
      stepRef.current = s
    }
  }, [])

  const advanceStep = useCallback((s: number) => {
    setMaxCompleted((prev) => Math.max(prev, s))
    setStepState(s)
    stepRef.current = s
  }, [])

  const [jobDesc, setJobDesc] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<BackendResumeContent | null>(null)
  const [optimizedData, setOptimizedData] = useState<BackendResumeContent | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [template, setTemplate] = useState<ResumeTemplate>("modern")
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [stageLabel, setStageLabel] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [scannedWarning, setScannedWarning] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!file) {
      setScannedWarning(false)
      return
    }
    let cancelled = false
    isScannedPdf(file).then((scanned) => {
      if (!cancelled) setScannedWarning(scanned)
    })
    return () => { cancelled = true }
  }, [file])

  const startProcessing = useCallback(async () => {
    if (!file) return
    setProcessing(true)
    setError(null)
    setProgress(0)
    setStageLabel("Starting...")
    setElapsed(0)

    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current)
      elapsedTimerRef.current = null
    }

    const controller = new AbortController()
    abortRef.current = controller

    await optimizeResumeStream(file, jobDesc, {
      onProgress: (p) => {
        setProgress(p.progress)
        setStageLabel(p.stage_label)

        if (p.stage === "optimizing") {
          if (!elapsedTimerRef.current) {
            setElapsed(0)
            elapsedTimerRef.current = setInterval(() => {
              setElapsed((e) => e + 1)
            }, 1000)
          }
        } else {
          if (elapsedTimerRef.current) {
            clearInterval(elapsedTimerRef.current)
            elapsedTimerRef.current = null
          }
          setElapsed(0)
        }
      },
      onCompleted: (parsed, optimized, id) => {
        setParsedData(parsed)
        setOptimizedData(optimized)
        setResumeId(id)
        setProgress(100)
        setStageLabel("Done!")
        setProcessing(false)
        advanceStep(3)
        router.replace("/ai-generator?step=3", { scroll: false })
      },
      onError: (_code, message) => {
        setError(message)
        setProcessing(false)
        setProgress(0)
        setStageLabel("")
        setElapsed(0)
      },
    }, controller.signal)
  }, [file, jobDesc, advanceStep, router])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const s = Number(searchParams.get("step"))
    if (s >= 1 && s <= 4) {
      if (!ready) {
        setStepState(s)
        stepRef.current = s
        setMaxCompleted(Math.max(1, Math.min(s, 4)))
      } else if (s !== stepRef.current) {
        goToStep(s)
      }
    }
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (step === 2 && !processing && !parsedData && !error && isConfigured) {
      startProcessing()
    }
  }, [step, processing, parsedData, error, startProcessing, isConfigured])

  const canContinue = () => {
    if (step === 1) return !aiConfigLoading && isConfigured && jobDesc.trim().length > 50 && file !== null
    return true
  }

  const nextStep = () => {
    if (step < 4 && step !== 2) {
      const next = step + 1
      advanceStep(next)
      router.replace(`/ai-generator?step=${next}`, { scroll: false })
    }
  }

  const prevStep = () => {
    if (step > 1 && step !== 2) {
      const prev = step - 1
      goToStep(prev)
      router.replace(`/ai-generator?step=${prev}`, { scroll: false })
    }
  }

  const handleAcceptChanges = async () => {
    if (!optimizedData || !resumeId) return
    setSaving(true)
    try {
      await updateResumeApi(resumeId, {
        template_id: template,
        content: optimizedData as unknown as Record<string, unknown>,
      })
      advanceStep(4)
      router.replace("/ai-generator?step=4", { scroll: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save resume"
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!resumeId) return
    setDownloading(true)
    setError(null)
    try {
      const blob = await api.download(`/resumes/${resumeId}/export?template=${template}`)
      if (blob.size === 0) throw new Error("Downloaded file is empty")
      const ext = blob.type.includes("wordprocessingml") ? "docx" : "pdf"
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `resume-${resumeId.slice(0, 8)}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download resume"
      setError(msg)
    } finally {
      setDownloading(false)
    }
  }

  const handleStartOver = () => {
    abortRef.current?.abort()
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current)
      elapsedTimerRef.current = null
    }
    setMaxCompleted(1)
    goToStep(1)
    setJobDesc("")
    setFile(null)
    setProgress(0)
    setProcessing(false)
    setError(null)
    setParsedData(null)
    setOptimizedData(null)
    setResumeId(null)
    setTemplate("modern")
    setSaving(false)
    setStageLabel("")
    setElapsed(0)
    router.replace("/ai-generator?step=1", { scroll: false })
  }

  const parsedFrontend = toFrontend(parsedData)
  const optimizedFrontend = toFrontend(optimizedData)

  if (!ready) {
    return (
      <DashboardShell title="AI Resume Generator">
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell title="AI Resume Generator">
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <div className="border-b bg-card px-4 py-3 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 lg:gap-4">
              {STEPS.map((s, i) => {
                const isNavigable = s.id <= maxCompleted
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!isNavigable || s.id === step || (s.id === 2 && processing)}
                      onClick={() => {
                        goToStep(s.id)
                        router.replace(`/ai-generator?step=${s.id}`, { scroll: false })
                      }}
                      className={cn(
                        "flex items-center gap-1.5",
                        isNavigable && s.id !== step && "cursor-pointer hover:opacity-80",
                        !isNavigable && "cursor-default"
                      )}
                    >
                      <div className={cn(
                        "flex size-7 items-center justify-center rounded-full text-[11px] font-medium transition-all",
                        s.id === step && "bg-brand text-black",
                        s.id < step && "bg-emerald-500/20 text-emerald-500",
                        s.id > step && "bg-muted text-muted-foreground"
                      )}>
                        {s.id < step ? <Check className="size-3.5" /> : s.id}
                      </div>
                      <span className={cn(
                        "hidden lg:inline text-xs",
                        s.id === step ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {s.label}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <ChevronRight className="size-3 text-muted-foreground/40 hidden lg:block" />
                    )}
                  </div>
                )
              })}
            </div>
            {step === 4 && (
              <Button variant="ghost" size="sm" onClick={handleStartOver}>
                <RotateCcw className="size-3.5" />
                Start Over
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            {!aiConfigLoading && !isConfigured && step === 1 && (
              <EnhancedCard hover={false} className="mb-6 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center gap-3">
                  <AlertCircle className="size-5 shrink-0 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">AI not configured</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure an AI provider to enable resume optimization. You can still browse the wizard, but AI processing requires an API key.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/settings/ai")}
                    className="shrink-0"
                  >
                    <Settings className="size-3.5" />
                    Configure AI
                  </Button>
                </div>
              </EnhancedCard>
            )}

            {step === 1 && (
              <JobInputStep
                jobDesc={jobDesc}
                setJobDesc={setJobDesc}
                file={file}
                setFile={setFile}
                template={template}
                setTemplate={setTemplate}
                scannedWarning={scannedWarning}
              />
            )}

            {step === 2 && (
              <ProcessingStep
                error={error}
                progress={progress}
                stageLabel={stageLabel}
                elapsed={elapsed}
                onRetry={startProcessing}
              />
            )}

            {step === 3 && parsedFrontend && optimizedFrontend && (
              <CompareStep
                parsedFrontend={parsedFrontend}
                optimizedFrontend={optimizedFrontend}
                error={error}
              />
            )}

            {step === 4 && optimizedFrontend && (
              <ExportStep
                optimizedFrontend={optimizedFrontend}
                template={template}
                setTemplate={setTemplate}
                resumeId={resumeId}
                downloading={downloading}
                error={error}
                onStartOver={handleStartOver}
                onDownloadPdf={handleDownloadPdf}
              />
            )}
          </div>

          <aside className="hidden w-64 shrink-0 border-l bg-card p-4 lg:block">
            <div className="flex items-start gap-2">
              <Lightbulb className="size-4 text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground">Tip</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{tips[step]}</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Quick Links</p>
              {[
                { icon: Target, label: "ATS Score", href: "/ats-score" },
                { icon: FileText, label: "My Resumes", href: "/resume" },
                { icon: Eye, label: "Resume Builder", href: "/resume/new" },
              ].map((l) => (
                <a key={l.label} href={l.href} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <l.icon className="size-3.5" />
                  {l.label}
                </a>
              ))}
            </div>
          </aside>
        </div>

        {step !== 2 && (
          <div className="flex items-center justify-between border-t bg-card px-4 py-3 lg:px-6">
            <Button variant="ghost" size="sm" onClick={prevStep} disabled={step === 1}>
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
            {step !== 4 && (
              <Button
                variant="brand"
                size="sm"
                onClick={step === 3 ? handleAcceptChanges : nextStep}
                disabled={!canContinue() || saving}
              >
                {step === 3 ? (saving ? "Saving..." : "Accept Changes") : "Continue"}
                {step !== 3 && <ArrowRight className="size-3.5" />}
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
