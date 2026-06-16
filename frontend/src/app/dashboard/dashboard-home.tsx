"use client"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { ResumeListItem } from "@/features/resume/resume-list-item"
import { FileText, BarChart3, Briefcase, Sparkles, Plus, TrendingUp, Search } from "lucide-react"

const stats = [
  { label: "Total Resumes", value: 12, icon: FileText, trend: { direction: "up" as const, value: "+2 this month" } },
  { label: "Avg ATS Score", value: "86%", icon: BarChart3, trend: { direction: "up" as const, value: "+12%" } },
  { label: "Interviews", value: 8, icon: Briefcase, trend: { direction: "up" as const, value: "+3" } },
  { label: "AI Generations", value: 47, icon: Sparkles, trend: { direction: "up" as const, value: "+18" } },
]

const recentResumes = [
  { name: "Senior Product Designer", role: "Google - L5", date: "Oct 24, 2024", score: 92, status: "Optimized" as const },
  { name: "Full-Stack Engineer", role: "Stripe - L3", date: "Oct 18, 2024", score: 78, status: "Draft" as const },
  { name: "ML Engineer", role: "OpenAI - IC4", date: "Oct 12, 2024", score: 86, status: "Complete" as const },
  { name: "Product Manager", role: "Linear - PM2", date: "Oct 5, 2024", score: 88, status: "Optimized" as const },
  { name: "DevOps Lead", role: "Vercel - Staff", date: "Sep 28, 2024", score: 71, status: "Draft" as const },
]

export function DashboardHome() {
  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Good morning, John 👋</h2>
            <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your resumes.</p>
          </div>
          <Button variant="brand" size="xl">
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
                <Button variant="ghost" size="xs">
                  View All
                </Button>
              </div>
              <div className="divide-y">
                {recentResumes.map((r) => (
                  <div key={r.name} className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-muted/30 transition-colors">
                    <ResumeListItem resume={r} />
                  </div>
                ))}
              </div>
            </EnhancedCard>
          </div>

          <div className="space-y-4">
            <EnhancedCard>
              <h3 className="mb-3 text-sm font-semibold text-foreground">ATS Score History</h3>
              <div className="flex items-end gap-1 h-24">
                {[65, 72, 68, 78, 82, 86].map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-brand/60 transition-all hover:bg-brand"
                      style={{ height: `${v}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">R{i + 1}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center">+21% improvement over last 6 resumes</p>
            </EnhancedCard>

            <EnhancedCard>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Missing Keywords</h3>
              <div className="flex flex-wrap gap-1.5">
                {["React.js", "TypeScript", "AWS", "Team Leadership", "Agile"].map((kw) => (
                  <button
                    key={kw}
                    className="rounded-full border border-brand/20 bg-brand/5 px-2.5 py-0.5 text-xs text-brand hover:bg-brand/10 transition-colors"
                  >
                    + {kw}
                  </button>
                ))}
              </div>
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
