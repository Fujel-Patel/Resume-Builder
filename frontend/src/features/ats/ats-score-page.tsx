"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Upload, FileText, Plus, AlertTriangle, Info, CheckCircle, X, RotateCcw, BarChart3, FileSpreadsheet, Hash, AlertCircle } from "lucide-react"

const sectionScores = [
  { label: "Format", score: 92, color: "#22C55E", tip: "Your formatting is ATS-friendly" },
  { label: "Keywords", score: 78, color: "#EAB308", tip: "Add more industry keywords" },
  { label: "Readability", score: 88, color: "#22C55E", tip: "Clear section structure" },
  { label: "Completeness", score: 82, color: "#22C55E", tip: "Add skills section" },
]

const missingKeywords = ["React.js", "TypeScript", "AWS", "Team Leadership", "Agile", "Docker", "GraphQL"]

const recommendations = [
  { severity: "high" as const, title: "Quantify achievements with numbers", description: "Use specific metrics (%, $, time saved) to demonstrate impact and improve keyword density." },
  { severity: "medium" as const, title: "Add a professional summary", description: "A 3-4 line summary at the top helps ATS parsers understand your profile at a glance." },
  { severity: "low" as const, title: "Include GitHub/portfolio links", description: "Links help recruiters verify your work and improve your online presence score." },
  { severity: "medium" as const, title: "Add more action verbs", description: "Replace passive language with strong action verbs like 'led', 'designed', 'implemented'." },
]

const severityConfig = {
  high: { icon: AlertTriangle, color: "text-destructive", badge: "error" as const },
  medium: { icon: Info, color: "text-amber-500", badge: "warning" as const },
  low: { icon: CheckCircle, color: "text-emerald-500", badge: "success" as const },
}

const quickStats = [
  { icon: FileSpreadsheet, label: "Word Count", value: "487" },
  { icon: Hash, label: "Bullet Points", value: "24" },
  { icon: AlertCircle, label: "Missing Keywords", value: "7" },
]

export function AtsScorePage() {
  const [file, setFile] = useState<{ name: string; size: string } | null>({ name: "senior-designer-resume.pdf", size: "245 KB" })
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload")
  const [jobDesc, setJobDesc] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const overallScore = 86

  const removeFile = () => setFile(null)

  return (
    <DashboardShell title="ATS Score Analysis">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">ATS Score Analysis</h2>
            <p className="text-sm text-muted-foreground">Analyze how your resume performs against ATS systems.</p>
          </div>
          <Button variant="brand" size="xl">
            <RotateCcw className="size-4" />
            New Analysis
          </Button>
        </div>

        <div className="rounded-card border bg-card overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${activeTab === "upload" ? "border-b-2 border-brand text-brand" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Upload className="inline size-3.5 mr-1" />
              Upload Resume
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${activeTab === "paste" ? "border-b-2 border-brand text-brand" : "text-muted-foreground hover:text-foreground"}`}
            >
              <FileText className="inline size-3.5 mr-1" />
              Paste Job Description
            </button>
          </div>

          <div className="p-4 lg:p-6">
            {activeTab === "upload" ? (
              file ? (
                <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10">
                      <FileText className="size-5 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="brand" size="sm">
                      <BarChart3 className="size-3.5" />
                      Check ATS
                    </Button>
                    <button onClick={removeFile} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile({ name: "resume.pdf", size: "245 KB" }) }}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 transition-colors ${dragOver ? "border-brand bg-brand/5" : "border-border"}`}
                >
                  <div className="flex size-14 items-center justify-center rounded-xl bg-brand/10">
                    <Upload className="size-6 text-brand" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">Upload your resume</p>
                  <p className="mt-1 text-xs text-muted-foreground">Drag & drop or click to browse</p>
                  <p className="mt-3 text-[11px] text-muted-foreground">Supports PDF, DOCX, TXT &middot; Max 10MB</p>
                  <Button variant="brandOutline" size="sm" className="mt-4">
                    <Upload className="size-3.5" />
                    Browse Files
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  rows={6}
                  className="w-full resize-none rounded-lg border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Paste the full job description here to compare against your resume..."
                />
                <div className="flex justify-end">
                  <Button variant="brand" size="sm">
                    <BarChart3 className="size-3.5" />
                    Analyze
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EnhancedCard className="flex flex-col items-center py-8">
              <div className="relative">
                <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
                  <circle cx="90" cy="90" r="78" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
                  <circle cx="90" cy="90" r="78" fill="none" stroke="#00FFF0" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={490.1}
                    strokeDashoffset={490.1 - (overallScore / 100) * 490.1}
                    className="drop-shadow-[0_0_8px_#00FFF0]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{overallScore}%</span>
                  <Badge variant="brand">Excellent</Badge>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm text-emerald-500">
                <span>&uarr;</span>
                <span className="text-xs">+12% vs last resume</span>
              </div>
            </EnhancedCard>
          </div>

          <div className="grid grid-cols-1 gap-3 self-start">
            {quickStats.map((s) => (
              <EnhancedCard key={s.label} className="flex items-center gap-3 py-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10">
                  <s.icon className="size-4 text-brand" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Section Scores</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sectionScores.map((s) => (
              <EnhancedCard key={s.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                  <span className="text-lg font-semibold text-foreground">{s.score}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{s.tip}</p>
                  {s.label === "Keywords" && (
                    <Button variant="brandGhost" size="xs">Improve</Button>
                  )}
                </div>
              </EnhancedCard>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <EnhancedCard>
            <div className="mb-1">
              <h3 className="text-sm font-semibold text-foreground">Missing Keywords</h3>
              <p className="text-xs text-muted-foreground">Add these keywords to improve your match rate.</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {missingKeywords.map((kw) => (
                <button
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs text-brand hover:bg-brand/10 transition-colors"
                >
                  <Plus className="size-3" />
                  {kw}
                </button>
              ))}
            </div>
          </EnhancedCard>

          <EnhancedCard>
            <div className="mb-1">
              <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
              <p className="text-xs text-muted-foreground">AI-powered suggestions to improve your ATS score.</p>
            </div>
            <div className="mt-3 space-y-2">
              {recommendations.map((r) => {
                const config = severityConfig[r.severity]
                return (
                  <div key={r.title} className="group rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${config.color}`}>
                        <config.icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-foreground">{r.title}</p>
                          <Badge variant={config.badge}>{r.severity}</Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{r.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </EnhancedCard>
        </div>

        <Button variant="brand" size="xl" className="w-full">
          <Sparkles className="size-4" />
          Optimize Resume with AI
        </Button>
      </div>
    </DashboardShell>
  )
}
