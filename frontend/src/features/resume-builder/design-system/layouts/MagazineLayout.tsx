"use client"
import type { ReactNode } from "react"

type MagazineLayoutProps = {
  hero: ReactNode
  children: ReactNode
  accentColor?: string
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  compact?: boolean
}

export function MagazineLayout({ hero, children, accentColor = "#2563eb", margin, compact }: MagazineLayoutProps) {
  const m = { top: 36, right: 36, bottom: 36, left: 36, ...margin }
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", boxSizing: "border-box" as const }}>
      <div style={{ padding: `${m.top}px ${m.right}px 0 ${m.left}px` }}>
        {hero}
        <div style={{ height: 3, backgroundColor: accentColor, margin: compact ? "10px 0 12px" : "16px 0 20px", borderRadius: 2 }} />
      </div>
      <div style={{ padding: `0 ${m.right}px ${m.bottom}px ${m.left}px` }}>
        {children}
      </div>
    </div>
  )
}
