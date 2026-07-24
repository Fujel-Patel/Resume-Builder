"use client"
import type { ReactNode } from "react"

type ModernGridProps = {
  header: ReactNode
  children: ReactNode
  columns?: [number, number]
  gap?: number
  accentColor?: string
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  compact?: boolean
}

export function ModernGrid({ header, children, columns = [0.45, 0.55], gap = 24, accentColor = "#2563eb", margin, compact }: ModernGridProps) {
  const m = { top: 36, right: 36, bottom: 36, left: 36, ...margin }
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", boxSizing: "border-box" as const, padding: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px` }}>
      <div style={{ marginBottom: compact ? 10 : 16 }}>{header}</div>
      <div style={{ height: 2, backgroundColor: accentColor, marginBottom: compact ? 12 : 20 }} />
      <div style={{ display: "grid", gridTemplateColumns: `${columns[0] * 100}% ${columns[1] * 100}%`, gap }}>
        {children}
      </div>
    </div>
  )
}
