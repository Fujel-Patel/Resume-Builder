"use client"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { FileText, Plus, Search, Edit3, Copy, Download, Trash2, Filter } from "lucide-react"

const resumes = [
  { name: "Senior Product Designer", role: "Google - L5", date: "Oct 24, 2024", score: 92, status: "Optimized" as const },
  { name: "Full-Stack Engineer", role: "Stripe - L3", date: "Oct 18, 2024", score: 78, status: "Draft" as const },
  { name: "ML Engineer", role: "OpenAI - IC4", date: "Oct 12, 2024", score: 86, status: "Complete" as const },
  { name: "Product Manager", role: "Linear - PM2", date: "Oct 5, 2024", score: 88, status: "Optimized" as const },
  { name: "DevOps Lead", role: "Vercel - Staff", date: "Sep 28, 2024", score: 71, status: "Draft" as const },
  { name: "Data Scientist", role: "Netflix - L4", date: "Sep 15, 2024", score: 83, status: "Complete" as const },
]

const statusVariant = {
  Optimized: "success" as const,
  Draft: "warning" as const,
  Complete: "brand" as const,
}

export function ResumePage() {
  return (
    <DashboardShell title="My Resumes">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">My Resumes</h2>
            <p className="text-sm text-muted-foreground">Manage and optimize your resume collection.</p>
          </div>
          <Button variant="brand" size="xl">
            <Plus className="size-4" />
            Create New
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search resumes..."
            />
          </div>
          <Button variant="outline" size="default">
            <Filter className="size-4" />
            Status
          </Button>
          <Button variant="outline" size="default">
            Sort: Last Modified
          </Button>
        </div>

        <div className="space-y-2">
          {resumes.map((r) => (
            <EnhancedCard key={r.name} hover className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                <FileText className="size-5 text-brand" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.role} &middot; {r.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{r.score}</span>
                <svg className="size-9 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                  <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" strokeLinecap="round"
                    stroke={r.score >= 80 ? "#22C55E" : r.score >= 60 ? "#EAB308" : "#EF4444"}
                    strokeDasharray={97.4}
                    strokeDashoffset={97.4 - (r.score / 100) * 97.4}
                  />
                </svg>
              </div>
              <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-xs"><Edit3 className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-xs"><Copy className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-xs"><Download className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-xs"><Trash2 className="size-3.5 text-destructive" /></Button>
              </div>
            </EnhancedCard>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
