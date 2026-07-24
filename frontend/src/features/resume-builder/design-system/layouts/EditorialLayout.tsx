"use client"
import type { ReactNode } from "react"

type EditorialLayoutProps = {
  children: ReactNode
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  accentColor?: string
  compact?: boolean
}

export function EditorialLayout({ children, margin, accentColor = "#111827", compact }: EditorialLayoutProps) {
  const m = compact
    ? { top: 30, right: 36, bottom: 30, left: 36, ...margin }
    : { top: 48, right: 56, bottom: 48, left: 56, ...margin }
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.6, color: "#1f2937", boxSizing: "border-box" as const, padding: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px` }}>
      {children}
    </div>
  )
}
