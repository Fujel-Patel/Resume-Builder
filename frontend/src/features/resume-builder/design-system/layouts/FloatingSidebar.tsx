"use client"
import type { ReactNode } from "react"

type FloatingSidebarProps = {
  sidebar: ReactNode
  main: ReactNode
  sidebarWidth?: number
  sidebarPosition?: "left" | "right"
  gap?: number
  sidebarBg?: string
  sidebarRadius?: number
  sidebarPadding?: number
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
}

export function FloatingSidebar({ sidebar, main, sidebarWidth = 28, sidebarPosition = "left", gap = 24, sidebarBg = "#f8fafc", sidebarRadius = 8, sidebarPadding = 24, margin }: FloatingSidebarProps) {
  const m = { top: 36, right: 36, bottom: 36, left: 36, ...margin }
  const sidebarEl = (
    <div style={{ width: `${sidebarWidth}%`, flexShrink: 0, backgroundColor: sidebarBg, borderRadius: sidebarRadius, padding: sidebarPadding, alignSelf: "flex-start" }}>
      {sidebar}
    </div>
  )
  const mainEl = (
    <div style={{ flex: 1, minWidth: 0 }}>
      {main}
    </div>
  )
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", display: "flex", gap, padding: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px`, alignItems: "flex-start" }}>
      {sidebarPosition === "left" ? <>{sidebarEl}{mainEl}</> : <>{mainEl}{sidebarEl}</>}
    </div>
  )
}
