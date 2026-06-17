"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type EnhancedCardProps = {
  children: ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
}

export function EnhancedCard({ children, className, glow, hover = true }: EnhancedCardProps) {
  return (
    <div
      className={cn(
        "rounded-card bg-card p-4 ring-1 ring-foreground/10 text-sm text-card-foreground transition-all duration-300",
        hover && "hover:-translate-y-1 hover:ring-foreground/20",
        glow && "ring-brand/30 hover:ring-brand/50 hover:shadow-glow-brand",
        className
      )}
    >
      {children}
    </div>
  )
}
