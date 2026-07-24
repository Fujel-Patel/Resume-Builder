"use client"
import type { ReactNode } from "react"

type SplitHeaderLayoutProps = {
  left: ReactNode
  right: ReactNode
  children: ReactNode
  accentColor?: string
  dividerColor?: string
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  compact?: boolean
}

export function SplitHeaderLayout({ left, right, children, accentColor = "#2563eb", dividerColor, margin, compact }: SplitHeaderLayoutProps) {
  const m = { top: 36, right: 36, bottom: 36, left: 36, ...margin }
  const dc = dividerColor ?? "#e5e7eb"
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", boxSizing: "border-box" as const, padding: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: compact ? 10 : 16 }}>
        {left}
        {right}
      </div>
      <div style={{ borderTop: `1px solid ${dc}`, marginBottom: compact ? 10 : 16 }} />
      {children}
    </div>
  )
}
