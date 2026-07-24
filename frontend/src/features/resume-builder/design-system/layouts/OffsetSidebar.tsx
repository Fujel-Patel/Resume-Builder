"use client"
import type { ReactNode } from "react"

type OffsetSidebarProps = {
  topBar: ReactNode
  sidebar: ReactNode
  main: ReactNode
  sidebarWidth?: number
  sidebarBg?: string
  gap?: number
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  compact?: boolean
}

export function OffsetSidebar({ topBar, sidebar, main, sidebarWidth = 28, sidebarBg = "#f1f5f9", gap = 24, margin, compact }: OffsetSidebarProps) {
  const m = { top: 28, right: 28, bottom: 28, left: 28, ...margin }
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", boxSizing: "border-box" as const }}>
      <div style={{ padding: compact ? `${m.top + 16}px ${m.right}px 8px ${m.left}px` : `${m.top + 32}px ${m.right}px 16px ${m.left}px` }}>
        {topBar}
      </div>
      <div style={{ display: "flex", padding: `0 ${m.right}px ${m.bottom}px ${m.left}px`, gap }}>
        <div style={{ width: `${sidebarWidth}%`, flexShrink: 0, backgroundColor: sidebarBg, borderRadius: 6, padding: compact ? "12px 10px" : "0 20px", alignSelf: "flex-start" }}>
          {sidebar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {main}
        </div>
      </div>
    </div>
  )
}
