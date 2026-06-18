"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { ResumeListItem } from "@/features/resume/resume-list-item"
import { Plus, Search, Edit3, Copy, Download, Trash2, RefreshCw } from "lucide-react"
import {
  listResumesApi,
  deleteResumeApi,
  duplicateResumeApi,
  exportResumePdf,
  type ResumeResponse,
} from "@/lib/api/resumes"
import { api } from "@/lib/api/client"

type ResumeItem = {
  id: string
  name: string
  role: string
  date: string
  score: number
  status: "Optimized" | "Draft" | "Complete"
  template_id: string
}

type ATSScan = {
  id: string
  resume_id: string | null
  overall_score: number
  created_at: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function toItem(r: ResumeResponse, score: number): ResumeItem {
  const d = r.data as { personal?: { job_title?: string } } | null
  const hasData = r.data !== null
  return {
    id: r.id,
    name: r.title,
    role: d?.personal?.job_title ?? "Resume",
    date: formatDate(r.updated_at),
    score,
    status: score > 0 ? "Optimized" : hasData ? "Complete" : "Draft",
    template_id: r.template_id,
  }
}

export function ResumePage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"date" | "name" | "score">("date")

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      listResumesApi(),
      api.get<ATSScan[]>("/ats/history"),
    ])
      .then(([resumeList, scans]) => {
        const scanMap = new Map<string, number>()
        for (const s of scans) {
          if (s.resume_id && !scanMap.has(s.resume_id)) {
            scanMap.set(s.resume_id, s.overall_score)
          }
        }
        const deduped = [...new Map(resumeList.map((r) => [r.id, r])).values()]
        setResumes(deduped.map((r) => toItem(r, scanMap.get(r.id) ?? 0)))
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load resumes"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    let result = [...resumes]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q))
    }
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter)
    }
    if (sortBy === "date") {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "score") {
      result.sort((a, b) => b.score - a.score)
    }
    return result
  }, [resumes, search, statusFilter, sortBy])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return
    try {
      await deleteResumeApi(id)
      setResumes((prev) => prev.filter((r) => r.id !== id))
    } catch {
      alert("Failed to delete resume")
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateResumeApi(id)
      fetchData()
    } catch {
      alert("Failed to duplicate resume")
    }
  }

  const handleDownload = async (id: string) => {
    try {
      await exportResumePdf(id)
    } catch {
      alert("Failed to export resume")
    }
  }

  if (loading) {
    return (
      <DashboardShell title="My Resumes">
        <div className="space-y-5">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-card bg-muted" />
            ))}
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell title="My Resumes">
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
            <RefreshCw className="mr-1 size-3" />
            Retry
          </Button>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell title="My Resumes">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">My Resumes</h2>
            <p className="text-sm text-muted-foreground">Manage and optimize your resume collection.</p>
          </div>
          <Button variant="brand" size="xl" onClick={() => router.push("/resume/new")}>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={statusFilter ?? ""}
            onChange={(e) => setStatusFilter(e.target.value || null)}
          >
            <option value="">All Status</option>
            <option value="Optimized">Optimized</option>
            <option value="Draft">Draft</option>
            <option value="Complete">Complete</option>
          </select>
          <select
            className="rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "name" | "score")}
          >
            <option value="date">Last Modified</option>
            <option value="name">Name</option>
            <option value="score">ATS Score</option>
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((r) => (
              <EnhancedCard key={r.id} hover className="flex items-center gap-4">
                <ResumeListItem
                  resume={r}
                  actions={
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Edit ${r.name}`}
                        onClick={() => router.push(`/resume/new?id=${r.id}`)}
                      >
                        <Edit3 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Duplicate ${r.name}`}
                        onClick={() => handleDuplicate(r.id)}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Download ${r.name}`}
                        onClick={() => handleDownload(r.id)}
                      >
                        <Download className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Delete ${r.name}`}
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  }
                />
              </EnhancedCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-card border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {search || statusFilter
                ? "No resumes match your search criteria."
                : "No resumes yet. Create your first one!"}
            </p>
            {!search && !statusFilter && (
              <Button variant="brand" size="default" className="mt-4" onClick={() => router.push("/resume/new")}>
                <Plus className="mr-1 size-4" />
                Create New Resume
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
