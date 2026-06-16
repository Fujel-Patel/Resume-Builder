import type { ReactNode } from "react"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScoreGauge } from "./score-gauge"

type ResumeData = {
  name: string
  role: string
  date: string
  score: number
  status: "Optimized" | "Draft" | "Complete"
}

type ResumeListItemProps = {
  resume: ResumeData
  actions?: ReactNode
}

const statusVariant: Record<string, "success" | "warning" | "brand"> = {
  Optimized: "success",
  Draft: "warning",
  Complete: "brand",
}

export function ResumeListItem({ resume, actions }: ResumeListItemProps) {
  const r = resume
  return (
    <>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
        <FileText className="size-5 text-brand" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
        <p className="text-xs text-muted-foreground">{r.role} &middot; {r.date}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-foreground">{r.score}</span>
        <ScoreGauge score={r.score} className="size-9" />
      </div>
      <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
      {actions}
    </>
  )
}
