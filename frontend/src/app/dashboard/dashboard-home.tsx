"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { ScoreGauge } from "@/features/resume/score-gauge"
import { FileText, BarChart3, Briefcase, Sparkles, Plus, TrendingUp, Search, RefreshCw } from "lucide-react"
import { useAppSelector } from "@/lib/hooks"
import { getDashboardData, type DashboardData } from "@/lib/api/dashboard"

export function DashboardHome() {
  const router = useRouter()
  const user = useAppSelector((s) => s.auth.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = () => {
    setLoading(true)
    setError(null)
    getDashboardData()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const firstName = user?.name?.split(" ")[0] ?? "there"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const templateLabels: Record<string, string> = {
    classic: "Classic",
    modern: "Modern",
    minimal: "Minimal",
    creative: "Creative",
  }

  const statusVariant: Record<string, "success" | "warning" | "brand"> = {
    Optimized: "success",
    Draft: "warning",
    Complete: "brand",
  }

  if (loading) {
    return (
      <DashboardShell title="Dashboard">
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-card bg-muted" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="h-64 animate-pulse rounded-card bg-muted" />
            </div>
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-card bg-muted" />
              <div className="h-32 animate-pulse rounded-card bg-muted" />
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error || !data) {
    return (
      <DashboardShell title="Dashboard">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{greeting}, {firstName} 👋</h2>
            <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your resumes.</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-card border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {error ?? "Couldn't load dashboard data"}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchDashboard}>
              <RefreshCw className="mr-1 size-3" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const stats = [
    { label: "Total Resumes", value: data.stats.total_resumes, icon: FileText, trend: undefined },
    { label: "Avg ATS Score", value: `${data.stats.avg_ats_score}%`, icon: BarChart3, trend: undefined },
    { label: "Interviews", value: data.stats.interviews, icon: Briefcase, trend: undefined },
    { label: "AI Generations", value: data.stats.ai_generations, icon: Sparkles, trend: undefined },
  ]

  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{greeting}, {firstName} 👋</h2>
            <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your resumes.</p>
          </div>
          <Button variant="brand" size="xl" onClick={() => router.push("/resume/new")}>
            <Plus className="size-4" />
            Create New Resume
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} data={s} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EnhancedCard className="p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">Recent Resumes</h3>
                <Button variant="ghost" size="xs" onClick={() => router.push("/resume")}>
                  View All
                </Button>
              </div>
              {data.recentResumes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {data.recentResumes.map((r) => (
                    <div
                      key={r.id}
                      className="cursor-pointer rounded-card bg-card p-4 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:ring-foreground/20"
                      onClick={() => router.push(`/resume/new?id=${r.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                            <FileText className="size-4.5 text-brand" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{r.role}</p>
                          </div>
                        </div>
                        <Badge variant={statusVariant[r.status]} className="shrink-0">{r.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                            {templateLabels[r.template_id] ?? r.template_id}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{r.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground">{r.score}</span>
                          <ScoreGauge score={r.score} className="size-8" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No resumes yet. Create your first one!
                </div>
              )}
            </EnhancedCard>
          </div>

          <div className="space-y-4">
            <EnhancedCard>
              <h3 className="mb-3 text-sm font-semibold text-foreground">ATS Score History</h3>
              {data.atsHistory.length > 0 ? (
                <>
                  <div className="flex items-end gap-1 h-24">
                    {data.atsHistory.map((v, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-sm bg-brand/60 transition-all hover:bg-brand"
                          style={{ height: `${v}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">R{i + 1}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Last {data.atsHistory.length} scans
                  </p>
                </>
              ) : (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No ATS scores yet
                </p>
              )}
            </EnhancedCard>

            <EnhancedCard>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Missing Keywords</h3>
              {data.missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {data.missingKeywords.map((kw) => (
                    <button
                      key={kw}
                      className="rounded-full border border-brand/20 bg-brand/5 px-2.5 py-0.5 text-xs text-brand hover:bg-brand/10 transition-colors"
                    >
                      + {kw}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No data yet &mdash; run an ATS scan
                </p>
              )}
            </EnhancedCard>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Search, label: "Upload Resume", desc: "Import an existing resume" },
            { icon: Sparkles, label: "AI Optimize", desc: "Enhance with AI suggestions" },
            { icon: TrendingUp, label: "Check ATS", desc: "Score against job descriptions" },
          ].map((a) => (
            <button
              key={a.label}
              className="flex items-center gap-3 rounded-card bg-card p-3 ring-1 ring-foreground/10 text-left transition-all hover:-translate-y-0.5 hover:ring-foreground/20"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                <a.icon className="size-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
