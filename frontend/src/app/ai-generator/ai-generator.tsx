"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Sparkles, Upload, FileText, Check, ArrowRight, Lightbulb, Download,
  Clipboard, RotateCcw, ArrowLeft, ChevronRight, Target, Search,
  X, Eye
} from "lucide-react"

const STEPS = [
  { id: 1, label: "Job Description" },
  { id: 2, label: "Upload Resume" },
  { id: 3, label: "AI Processing" },
  { id: 4, label: "Compare" },
  { id: 5, label: "Export" },
]

const tips: Record<number, string> = {
  1: "Paste a detailed job description for the best keyword matching results. Include required skills and qualifications.",
  2: "Upload a PDF or DOCX resume. You can also select from recently optimized resumes.",
  3: "Our AI is analyzing your resume against the job description. This takes about 30 seconds.",
  4: "Review the changes side-by-side. Green highlights show optimized content added by AI.",
  5: "Download your optimized resume in your preferred format. Your original is always preserved.",
}

const recentResumes = [
  { name: "Senior Product Designer", role: "Google - L5", date: "Oct 24, 2024", score: 92 },
  { name: "Full-Stack Engineer", role: "Stripe - L3", date: "Oct 18, 2024", score: 78 },
  { name: "ML Engineer", role: "OpenAI - IC4", date: "Oct 12, 2024", score: 86 },
]

export function AiGeneratorPage() {
  const [step, setStep] = useState(1)
  const [jobDesc, setJobDesc] = useState("")
  const [file, setFile] = useState<{ name: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (step === 3 && !processing) {
      setProcessing(true)
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval)
            return 100
          }
          return p + Math.floor(Math.random() * 15) + 5
        })
      }, 600)
      setTimeout(() => {
        clearInterval(interval)
        setProcessing(false)
        setStep(4)
        setProgress(100)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [step, processing])

  const canContinue = () => {
    if (step === 1) return jobDesc.trim().length > 50
    if (step === 2) return file !== null
    return true
  }

  const nextStep = () => {
    if (step < 5 && (step !== 3)) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1 && step !== 3) setStep(step - 1)
  }

  const handleStartOver = () => {
    setStep(1)
    setJobDesc("")
    setFile(null)
    setProgress(0)
    setProcessing(false)
  }

  return (
    <DashboardShell title="AI Resume Generator">
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <div className="border-b bg-card px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
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
                  </div>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="size-3 text-muted-foreground/40 hidden lg:block" />
                  )}
                </div>
              ))}
            </div>
            {step === 5 && (
              <Button variant="ghost" size="sm" onClick={handleStartOver}>
                <RotateCcw className="size-3.5" />
                Start Over
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            {step === 1 && (
              <div className="mx-auto max-w-2xl space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Paste the job description</h2>
                  <p className="text-sm text-muted-foreground">We&apos;ll analyze it to match your resume against the requirements.</p>
                </div>
                <EnhancedCard>
                  <textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    rows={14}
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
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-3xl space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Upload your resume</h2>
                  <p className="text-sm text-muted-foreground">Upload a resume or select one you&apos;ve already optimized.</p>
                </div>
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
                        <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile({ name: "resume.pdf" }) }}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 transition-colors",
                          dragOver ? "border-brand bg-brand/5" : "border-border"
                        )}
                      >
                        <div className="flex size-14 items-center justify-center rounded-xl bg-brand/10">
                          <Upload className="size-6 text-brand" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-foreground">Drop your resume here</p>
                        <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
                        <p className="mt-2 text-[11px] text-muted-foreground">PDF, DOCX, TXT &middot; Max 10MB</p>
                        <Button variant="brandOutline" size="sm" className="mt-4">
                          <Upload className="size-3.5" />
                          Browse Files
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Resumes</p>
                    <div className="space-y-2">
                      {recentResumes.map((r) => (
                        <button
                          key={r.name}
                          onClick={() => setFile({ name: r.name })}
                          className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-foreground/20"
                        >
                          <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10">
                            <FileText className="size-4 text-brand" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{r.name}</p>
                            <p className="text-[11px] text-muted-foreground">{r.role} &middot; {r.date}</p>
                          </div>
                          <span className="text-xs font-semibold text-foreground">{r.score}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mx-auto max-w-md flex flex-col items-center justify-center py-16 text-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
                  <div className="relative flex size-20 items-center justify-center rounded-full bg-brand/10">
                    <Sparkles className="size-8 text-brand" />
                  </div>
                </div>
                <h2 className="mt-6 text-lg font-semibold text-foreground">AI is processing your resume</h2>
                <p className="mt-1 text-sm text-muted-foreground">Analyzing against the job description...</p>
                <div className="mt-6 w-full max-w-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Matching keywords</span>
                    <span className="text-xs font-medium text-foreground">{Math.min(progress, 100)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  {["Parsing", "Matching", "Optimizing"].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1.5">
                      <div className={cn(
                        "size-2 rounded-full transition-colors",
                        progress < 33 ? (s === "Parsing" ? "bg-brand" : "bg-muted") :
                        progress < 66 ? (s !== "Optimizing" ? "bg-emerald-500" : "bg-muted") :
                        "bg-emerald-500"
                      )} />
                      <span className="text-[11px] text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-5xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Compare versions</h2>
                    <p className="text-sm text-muted-foreground">Review AI-optimized changes before applying.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                      <span className="text-xs text-muted-foreground line-through">86%</span>
                      <ArrowRight className="size-3 text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-500">94%</span>
                      <Badge variant="success">+8 pts</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="size-2 rounded-full bg-muted-foreground/40" />
                      <span className="text-xs font-medium text-muted-foreground uppercase">Original</span>
                    </div>
                    <div className="rounded-card border bg-white p-5 text-black text-xs leading-relaxed space-y-3 shadow-sm">
                      <div className="text-center">
                        <p className="text-sm font-bold">John Doe</p>
                        <p className="text-[11px] text-gray-500">john@example.com &middot; (555) 123-4567</p>
                      </div>
                      <div>
                        <div className="border-b border-gray-200 pb-0.5 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">PROFESSIONAL SUMMARY</span>
                        </div>
                        <p>Senior Product Designer with experience crafting user-centered products.</p>
                      </div>
                      <div>
                        <div className="border-b border-gray-200 pb-0.5 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">EXPERIENCE</span>
                        </div>
                        <p className="font-medium">Senior Product Designer</p>
                        <p className="text-gray-500">Linear &middot; 2022 - Present</p>
                        <p>Lead designer for the core product experience. Redesigned the project management interface.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium text-emerald-500 uppercase">AI Optimized</span>
                    </div>
                    <div className="rounded-card border border-emerald-500/30 bg-white p-5 text-black text-xs leading-relaxed space-y-3 shadow-sm shadow-emerald-500/5">
                      <div className="text-center">
                        <p className="text-sm font-bold">John Doe</p>
                        <p className="text-[11px] text-gray-500">john@example.com &middot; (555) 123-4567 &middot; linkedin.com/in/johndoe</p>
                      </div>
                      <div>
                        <div className="border-b border-gray-200 pb-0.5 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">PROFESSIONAL SUMMARY</span>
                        </div>
                        <p>Senior Product Designer with <span className="bg-emerald-100 px-0.5 rounded">8+ years of experience</span> crafting user-centered digital products. <span className="bg-emerald-100 px-0.5 rounded">Expert in design systems, accessibility, and driving measurable business outcomes through thoughtful UX.</span></p>
                      </div>
                      <div>
                        <div className="border-b border-gray-200 pb-0.5 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">EXPERIENCE</span>
                        </div>
                        <p className="font-medium">Senior Product Designer</p>
                        <p className="text-gray-500">Linear &middot; 2022 - Present</p>
                        <p>Lead designer for the core product experience. Redesigned the project management interface, <span className="bg-emerald-100 px-0.5 rounded">resulting in a 25% increase in user engagement</span>. Established the company design system <span className="bg-emerald-100 px-0.5 rounded">adopted by 40+ engineers</span>.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="lg">
                    <X className="size-4" />
                    Reject Changes
                  </Button>
                  <Button variant="brand" size="lg" onClick={nextStep}>
                    <Check className="size-4" />
                    Accept Changes
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="mx-auto max-w-lg flex flex-col items-center py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="size-8 text-emerald-500" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-foreground">Resume Optimized!</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your ATS score improved by 8 points. Ready to export?</p>
                <div className="mt-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                  <span className="text-xs font-medium text-emerald-500">86% &rarr; 94% ATS Score</span>
                </div>

                <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
                  {[
                    { icon: Download, label: "PDF", desc: "Printable format" },
                    { icon: FileText, label: "DOCX", desc: "Editable Word file" },
                    { icon: Clipboard, label: "Clipboard", desc: "Copy to clipboard" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className="flex flex-col items-center gap-2 rounded-card border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10">
                        <opt.icon className="size-5 text-brand" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                      <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                    </button>
                  ))}
                </div>

                <button onClick={handleStartOver} className="mt-8 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RotateCcw className="inline size-3 mr-1" />
                  Start over with a new resume
                </button>
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

        {step !== 3 && step !== 5 && (
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
            <Button
              variant="brand"
              size="sm"
              onClick={nextStep}
              disabled={!canContinue()}
            >
              {step === 4 ? "Accept Changes" : "Continue"}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
