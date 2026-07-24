"use client"
import type { ReactNode } from "react"

type ExecutiveHeaderProps = {
  header: ReactNode
  children: ReactNode
  accentColor?: string
  dividerColor?: string
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  compact?: boolean
}

export function ExecutiveHeader({ header, children, accentColor = "#355E88", dividerColor, margin, compact }: ExecutiveHeaderProps) {
  const m = { top: 36, right: 36, bottom: 36, left: 36, ...margin }
  const dc = dividerColor ?? accentColor
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", boxSizing: "border-box" as const, padding: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px` }}>
      {header}
      <div style={{ borderTop: `1.5px solid ${dc}`, opacity: 0.5, margin: compact ? "8px 0 10px" : "12px 0 16px" }} />
      {children}
    </div>
  )
}
