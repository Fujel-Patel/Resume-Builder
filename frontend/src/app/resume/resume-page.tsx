"use client"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { ResumeListItem } from "@/features/resume/resume-list-item"
import { Plus, Search, Edit3, Copy, Download, Trash2, Filter } from "lucide-react"

const resumes = [
  { name: "Senior Product Designer", role: "Google - L5", date: "Oct 24, 2024", score: 92, status: "Optimized" as const },
  { name: "Full-Stack Engineer", role: "Stripe - L3", date: "Oct 18, 2024", score: 78, status: "Draft" as const },
  { name: "ML Engineer", role: "OpenAI - IC4", date: "Oct 12, 2024", score: 86, status: "Complete" as const },
  { name: "Product Manager", role: "Linear - PM2", date: "Oct 5, 2024", score: 88, status: "Optimized" as const },
  { name: "DevOps Lead", role: "Vercel - Staff", date: "Sep 28, 2024", score: 71, status: "Draft" as const },
  { name: "Data Scientist", role: "Netflix - L4", date: "Sep 15, 2024", score: 83, status: "Complete" as const },
]

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
              <ResumeListItem
                resume={r}
                actions={
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-xs" aria-label={`Edit ${r.name}`}>
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" aria-label={`Duplicate ${r.name}`}>
                      <Copy className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" aria-label={`Download ${r.name}`}>
                      <Download className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" aria-label={`Delete ${r.name}`}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                }
              />
            </EnhancedCard>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
