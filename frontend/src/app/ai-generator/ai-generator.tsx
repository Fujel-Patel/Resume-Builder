"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import { ResumePreview } from "@/features/resume/resume-preview"
import { useAiConfig } from "@/hooks/use-ai-config"
import { cn } from "@/lib/utils"
import {
  Sparkles, FileText, Check, ArrowRight, Lightbulb, Download,
  RotateCcw, ArrowLeft, ChevronRight, Target, Search,
  X, Eye, RefreshCw, AlertCircle, Settings
} from "lucide-react"
import { type BackendResumeContent } from "@/lib/api/ai-suggest"
import { optimizeResumeStream } from "@/lib/api/ai-stream"
import { updateResumeApi } from "@/lib/api/resumes"
import { api } from "@/lib/api/client"
import type { ResumeTemplate, ResumeData } from "@/features/resume/types"

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

const TEMPLATES: { id: ResumeTemplate; label: string; desc: string }[] = [
  { id: "classic", label: "Classic", desc: "Traditional serif layout" },
  { id: "modern", label: "Modern", desc: "Dark navy header, clean sans" },
  { id: "minimal", label: "Minimal", desc: "Light, airy, compact" },
  { id: "creative", label: "Creative", desc: "Two-column with dark sidebar" },
]

function toFrontend(d: BackendResumeContent | null): ResumeData | null {
  if (!d || typeof d !== "object") return null
  const p = (d.personal || {}) as Record<string, string>
  return {
    personal: {
      name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "",
      title: p.job_title || "",
      email: p.email || "",
      phone: p.mobile || "",
      location: p.address || "",
    },
    links: {
      linkedin: p.linkedin || "",
      github: p.github || "",
      portfolio: p.portfolio || "",
      website: "",
    },
    summary: d.summary || "",
    skills: d.skills || [],
    skillGroups: d.skill_groups ?? null,
    experience: (d.experience || []).map((e) => ({
      company: e.company || "",
      role: e.role || "",
      startDate: (e.duration || "").split(" - ")[0] || "",
      endDate: (e.duration || "").split(" - ")[1] || "",
      description: (e.bullets || []).join("\n"),
    })),
    education: (d.education || []).map((e) => ({
      school: e.institution || "",
      degree: e.degree || "",
      field: "",
      startDate: e.year || "",
      endDate: e.grade || "",
    })),
    projects: (d.projects || []).map((p) => ({
      name: p.name || "",
      description: p.description || "",
    })),
    certifications: (d.certifications || []).map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.year || "",
    })),
    customSections: [],
  }
}

function diff(a: string | undefined, b: string | undefined): boolean {
  return a?.trim() !== b?.trim()
}

function diffArr<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  return JSON.stringify(a) !== JSON.stringify(b)
}

function CompareSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-2">
        <p className="text-xs font-medium text-foreground">{label}</p>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
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
  const abortRef = useRef<AbortController | null>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      onError: (code, message) => {
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
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current)
      }
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
          <div className="flex items-center justify-between">
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
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Template</p>
                    <div className="space-y-2">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTemplate(t.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-foreground/20",
                            template === t.id && "border-brand/50 ring-1 ring-brand/20"
                          )}
                        >
                          <div className={cn(
                            "flex size-9 items-center justify-center rounded-lg",
                            template === t.id ? "bg-brand/10" : "bg-muted"
                          )}>
                            <FileText className={cn("size-4", template === t.id ? "text-brand" : "text-muted-foreground")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{t.label}</p>
                            <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                          </div>
                          {template === t.id && <Check className="size-3.5 text-brand" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-md flex flex-col items-center justify-center py-16 text-center">
                {error ? (
                  <>
                    <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
                      <AlertCircle className="size-8 text-destructive" />
                    </div>
                    <h2 className="mt-6 text-lg font-semibold text-foreground">Processing failed</h2>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xs">{error}</p>
                    <Button variant="brand" className="mt-6" onClick={startProcessing}>
                      <RefreshCw className="size-3.5" />
                      Retry
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
                      <div className="relative flex size-20 items-center justify-center rounded-full bg-brand/10">
                        <Sparkles className="size-8 text-brand" />
                      </div>
                    </div>
                    <h2 className="mt-6 text-lg font-semibold text-foreground">AI is processing your resume</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {elapsed > 0 ? `${stageLabel} (${elapsed}s)` : stageLabel}
                    </p>
                    <div className="mt-6 w-full max-w-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium text-foreground">{Math.min(progress, 100)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 3 && parsedFrontend && optimizedFrontend && (
              <div className="mx-auto max-w-5xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Review AI changes</h2>
                    <p className="text-sm text-muted-foreground">Review changes before applying them to your resume.</p>
                  </div>
                  <Badge variant="success">Optimized</Badge>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {diff(parsedFrontend.personal.title, optimizedFrontend.personal.title) && (
                    <CompareSection label="Job Title">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-card p-3">
                          <p className="text-[11px] text-muted-foreground mb-1">Original</p>
                          <p className="text-sm text-foreground">{parsedFrontend.personal.title || "(none)"}</p>
                        </div>
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                          <p className="text-[11px] text-emerald-600 mb-1">Optimized</p>
                          <p className="text-sm font-medium text-foreground">{optimizedFrontend.personal.title || "(none)"}</p>
                        </div>
                      </div>
                    </CompareSection>
                  )}

                  {diff(parsedFrontend.summary, optimizedFrontend.summary) && (
                    <CompareSection label="Professional Summary">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-card p-3">
                          <p className="text-[11px] text-muted-foreground mb-1">Original</p>
                          <p className="text-xs leading-relaxed text-foreground">{parsedFrontend.summary || "(none)"}</p>
                        </div>
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                          <p className="text-[11px] text-emerald-600 mb-1">Optimized</p>
                          <p className="text-xs leading-relaxed text-foreground">{optimizedFrontend.summary || "(none)"}</p>
                        </div>
                      </div>
                    </CompareSection>
                  )}

                  {diffArr(parsedFrontend.skills, optimizedFrontend.skills) && (
                    <CompareSection label="Skills">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-card p-3">
                          <p className="text-[11px] text-muted-foreground mb-2">Original</p>
                          <div className="flex flex-wrap gap-1.5">
                            {parsedFrontend.skills.map((s) => (
                              <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                          <p className="text-[11px] text-emerald-600 mb-2">Optimized</p>
                          <div className="flex flex-wrap gap-1.5">
                            {optimizedFrontend.skills.map((s) => (
                              <span key={s} className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-700 font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CompareSection>
                  )}

                  {optimizedFrontend.experience.map((exp, i) => {
                    const orig = parsedFrontend.experience[i]
                    if (!orig || !diff(orig.description, exp.description)) return null
                    return (
                      <CompareSection key={`exp-${i}`} label={`Experience — ${exp.role} @ ${exp.company}`}>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border bg-card p-3">
                            <p className="text-[11px] text-muted-foreground mb-1">Original</p>
                            <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{orig.description || "(none)"}</p>
                          </div>
                          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                            <p className="text-[11px] text-emerald-600 mb-1">Optimized</p>
                            <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{exp.description || "(none)"}</p>
                          </div>
                        </div>
                      </CompareSection>
                    )
                  })}

                  {optimizedFrontend.projects.map((proj, i) => {
                    const orig = parsedFrontend.projects[i]
                    if (!orig || !diff(orig.description, proj.description)) return null
                    return (
                      <CompareSection key={`proj-${i}`} label={`Project — ${proj.name}`}>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border bg-card p-3">
                            <p className="text-[11px] text-muted-foreground mb-1">Original</p>
                            <p className="text-xs leading-relaxed text-foreground">{orig.description || "(none)"}</p>
                          </div>
                          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                            <p className="text-[11px] text-emerald-600 mb-1">Optimized</p>
                            <p className="text-xs leading-relaxed text-foreground">{proj.description || "(none)"}</p>
                          </div>
                        </div>
                      </CompareSection>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 4 && optimizedFrontend && (
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
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

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-1 space-y-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Template</p>
                    <div className="space-y-2">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTemplate(t.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-foreground/20",
                            template === t.id && "border-brand/50 ring-1 ring-brand/20"
                          )}
                        >
                          <div className={cn(
                            "flex size-9 items-center justify-center rounded-lg",
                            template === t.id ? "bg-brand/10" : "bg-muted"
                          )}>
                            <FileText className={cn("size-4", template === t.id ? "text-brand" : "text-muted-foreground")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{t.label}</p>
                            <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                          </div>
                          {template === t.id && <Check className="size-3.5 text-brand" />}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      <Button variant="brand" className="w-full" onClick={handleDownloadPdf} disabled={!resumeId || downloading}>
                        <Download className="size-4" />
                        {downloading ? "Downloading..." : "Download PDF"}
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => resumeId && router.push(`/resume/new?id=${resumeId}`)} disabled={!resumeId}>
                        <Eye className="size-4" />
                        Open in Builder
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleStartOver}>
                        <RotateCcw className="size-3.5" />
                        Start Over
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-lg border shadow-sm">
                      <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Preview — {TEMPLATES.find((t) => t.id === template)?.label}</p>
                      </div>
                      <div className="bg-[#0A0A0A] p-4" style={{ minHeight: 400 }}>
                        <div className="mx-auto max-w-[210mm] scale-[0.7] origin-top">
                          <ResumePreview data={optimizedFrontend} template={template} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={step === 1}
            >
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
