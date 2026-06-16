"use client"

import { cn } from "@/lib/utils"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import type { StatCardData } from "@/types/design"
import { TrendingUp, TrendingDown } from "lucide-react"

type StatCardProps = {
  data: StatCardData
  className?: string
}

export function StatCard({ data, className }: StatCardProps) {
  return (
    <EnhancedCard className={className}>
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10">
          <data.icon className="size-5 text-brand" />
        </div>
        {data.trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              data.trend.direction === "up"
                ? "text-emerald-500"
                : "text-red-500"
            )}
          >
            {data.trend.direction === "up" ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {data.trend.value}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold text-foreground">{data.value}</p>
        <p className="text-xs text-muted-foreground">{data.label}</p>
      </div>
    </EnhancedCard>
  )
}
