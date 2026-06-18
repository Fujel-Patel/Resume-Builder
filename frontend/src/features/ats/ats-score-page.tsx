"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { ScoreGauge } from "@/features/resume/score-gauge"
import { toast } from "sonner"
import {
  Upload,
  FileText,
  Plus,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  RotateCcw,
  BarChart3,
  Hash,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react"
import {
  scoreUploadApi,
  scoreResumeApi,
  getHistoryApi,
  getScanApi,
  type ScanResult,
} from "@/lib/api/ats"

const severityConfig = {
  high: { icon: AlertTriangle, color: "text-destructive", badge: "error" as const },
  medium: { icon: Info, color: "text-amber-500", badge: "warning" as const },
  low: { icon: CheckCircle, color: "text-emerald-500", badge: "success" as const },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const SECTION_META = [
  { key: "format", label: "Format", tip: "ATS-friendly formatting" },
  { key: "keywords", label: "Keywords", tip: "Industry keyword density" },
  { key: "readability", label: "Readability", tip: "Clear section structure" },
  { key: "completeness", label: "Completeness", tip: "Section coverage" },
] as const

const EMPTY_SCORE: ScanResult["score_report"] = {
  overall_score: 0,
  section_scores: { format: 0, keywords: 0, readability: 0, completeness: 0 },
  missing_keywords: [],
  suggestions: [],
}

type ActiveView = "upload" | "paste"

export function AtsScorePage() {
  const [activeTab, setActiveTab] = useState<ActiveView>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [jobDesc, setJobDesc] = useState("")

  const [analyzing, setAnalyzing] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [history, setHistory] = useState<ScanResult[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const data = await getHistoryApi(0, 10)
      setHistory(data)
    } catch {
      // silent fail for history
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleFile = (f: File) => {
    setFile(f)
    setScanResult(null)
    setError(null)
  }

  const removeFile = () => setFile(null)

  const resetAll = () => {
    setFile(null)
    setResumeText("")
    setJobDesc("")
    setScanResult(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (activeTab === "upload" && !file) {
      toast.error("Upload a resume file first")
      return
    }
    if (activeTab === "paste" && !resumeText.trim()) {
      toast.error("Paste your resume text first")
      return
    }

    setAnalyzing(true)
    setError(null)
    setScanResult(null)

    try {
      let result: ScanResult
      if (activeTab === "upload") {
        result = await scoreUploadApi(file!, jobDesc || undefined)
      } else {
        result = await scoreResumeApi(resumeText, jobDesc || undefined)
      }
      setScanResult(result)
      toast.success("ATS analysis complete")
      fetchHistory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ATS scoring failed"
      setError(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  const loadHistoryScan = async (id: string) => {
    setAnalyzing(true)
    setError(null)
    try {
      const result = await getScanApi(id)
      setScanResult(result)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load scan")
    } finally {
      setAnalyzing(false)
    }
  }

  const sectionScores = scanResult
    ? SECTION_META.map((s) => ({
        ...s,
        score: scanResult.score_report.section_scores[s.key],
        color:
          scanResult.score_report.section_scores[s.key] >= 80
            ? "#22C55E"
            : scanResult.score_report.section_scores[s.key] >= 60
              ? "#EAB308"
              : "#EF4444",
      }))
    : []

  const hasResult = !!scanResult

  return (
    <DashboardShell title="ATS Score Analysis">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">ATS Score Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Analyze how your resume performs against ATS systems.
            </p>
          </div>
          <Button variant="brand" size="xl" onClick={resetAll}>
            <RotateCcw className="size-4" />
            New Analysis
          </Button>
        </div>

        {/* Input Section (hidden while analyzing) */}
        {!analyzing && !hasResult && (
          <>
            {/* Tabs */}
            <div className="rounded-card border bg-card overflow-hidden">
              <div className="flex border-b">
                {(["upload", "paste"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-brand text-brand"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "upload" ? (
                      <>
                        <Upload className="inline size-3.5 mr-1" />
                        Upload Resume
                      </>
                    ) : (
                      <>
                        <FileText className="inline size-3.5 mr-1" />
                        Paste Resume
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4 p-4 lg:p-6">
                {activeTab === "upload" ? (
                  file ? (
                    <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                          <FileText className="size-5 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <FileUpload onFile={handleFile} />
                  )
                ) : (
                  <Textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={8}
                    placeholder="Paste your full resume text here..."
                    className="min-h-32"
                  />
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Job Description{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    rows={5}
                    placeholder="Paste the job description here to compare against your resume..."
                    className="min-h-24"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="brand"
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={
                      (activeTab === "upload" && !file) ||
                      (activeTab === "paste" && !resumeText.trim())
                    }
                  >
                    <BarChart3 className="size-4" />
                    Analyze with AI
                  </Button>
                </div>
              </div>
            </div>

            {/* History (when no active result) */}
            {history.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="size-4" />
                  Past Scans
                </h3>
                <div className="space-y-2">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => loadHistoryScan(h.id)}
                      className="w-full flex items-center justify-between rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm text-foreground truncate">
                          {formatDate(h.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            h.overall_score >= 80
                              ? "success"
                              : h.overall_score >= 60
                                ? "warning"
                                : "error"
                          }
                        >
                          {h.overall_score}%
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingHistory && (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            )}
          </>
        )}

        {/* Analyzing State */}
        {analyzing && !scanResult && (
          <div className="space-y-6">
            <EnhancedCard hover={false}>
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <Loader2 className="size-8 animate-spin text-brand" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Analyzing your resume with AI...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Checking ATS compatibility, keywords, and formatting.
                  </p>
                </div>
              </div>
            </EnhancedCard>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-card" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-card" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <EnhancedCard hover={false} className="border-destructive/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 mt-0.5 text-destructive" />
              <div className="flex-1 text-sm text-destructive min-w-0">
                <p className="font-medium">Analysis failed</p>
                <p className="text-destructive/80 mt-1 break-words">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAnalyze} className="shrink-0">
                Retry
              </Button>
            </div>
          </EnhancedCard>
        )}

        {/* Results */}
        {hasResult && (
          <>
            {/* Score gauge + quick stats */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <EnhancedCard className="flex flex-col items-center py-8">
                  <div className="relative">
                    <ScoreGauge
                      score={scanResult.overall_score}
                      size="lg"
                      variant="brand"
                      className="drop-shadow-[0_0_8px_#00FFF0]"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-foreground">
                        {scanResult.overall_score}%
                      </span>
                      <Badge
                        variant={
                          scanResult.overall_score >= 80
                            ? "success"
                            : scanResult.overall_score >= 60
                              ? "warning"
                              : "error"
                        }
                      >
                        {scanResult.overall_score >= 80
                          ? "Excellent"
                          : scanResult.overall_score >= 60
                            ? "Good"
                            : "Needs Work"}
                      </Badge>
                    </div>
                  </div>
                  {scanResult.score_report.overall_score !== scanResult.overall_score && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Report score: {scanResult.score_report.overall_score}%
                    </p>
                  )}
                </EnhancedCard>
              </div>

              <div className="grid grid-cols-1 gap-3 self-start">
                <EnhancedCard className="flex items-center gap-3 py-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10">
                    <Hash className="size-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {scanResult.score_report.missing_keywords.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Missing Keywords</p>
                  </div>
                </EnhancedCard>
                <EnhancedCard className="flex items-center gap-3 py-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10">
                    <FileSpreadsheet className="size-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {scanResult.score_report.suggestions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Suggestions</p>
                  </div>
                </EnhancedCard>
              </div>
            </div>

            {/* Section scores */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Section Scores</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sectionScores.map((s) => (
                  <EnhancedCard key={s.key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                      <span className="text-lg font-semibold text-foreground">{s.score}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${s.score}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{s.tip}</p>
                    </div>
                  </EnhancedCard>
                ))}
              </div>
            </div>

            {/* Missing keywords + Recommendations */}
            <div className="grid gap-6 lg:grid-cols-2">
              <EnhancedCard>
                <div className="mb-1">
                  <h3 className="text-sm font-semibold text-foreground">Missing Keywords</h3>
                  <p className="text-xs text-muted-foreground">
                    Add these keywords to improve your match rate.
                  </p>
                </div>
                {scanResult.score_report.missing_keywords.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {scanResult.score_report.missing_keywords.map((kw) => (
                      <button
                        key={kw}
                        className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs text-brand hover:bg-brand/10 transition-colors"
                      >
                        <Plus className="size-3" />
                        {kw}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    No missing keywords — great keyword coverage!
                  </p>
                )}
              </EnhancedCard>

              <EnhancedCard>
                <div className="mb-1">
                  <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
                  <p className="text-xs text-muted-foreground">
                    AI-powered suggestions to improve your ATS score.
                  </p>
                </div>
                {scanResult.score_report.suggestions.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {scanResult.score_report.suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="group rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-amber-500">
                            <Info className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground">{s}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    No suggestions — your resume looks great!
                  </p>
                )}
              </EnhancedCard>
            </div>

            {/* Optimize CTA */}
            <Button variant="brand" size="xl" className="w-full">
              <Sparkles className="size-4" />
              Optimize Resume with AI
            </Button>
          </>
        )}
      </div>
    </DashboardShell>
  )
}
