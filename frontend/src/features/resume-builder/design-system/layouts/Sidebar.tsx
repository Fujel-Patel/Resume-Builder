"use client"
import type { ReactNode } from "react"

type SidebarProps = {
  sidebar: ReactNode
  main: ReactNode
  sidebarWidth?: number
  sidebarPosition?: "left" | "right"
  gap?: number
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  sidebarBg?: string
  sidebarPadding?: number
}

export function Sidebar({ sidebar, main, sidebarWidth = 28, sidebarPosition = "left", gap = 24, margin, sidebarBg, sidebarPadding }: SidebarProps) {
  const m = { top: 36, right: 36, bottom: 36, left: 36, ...margin }
  const sp = sidebarPadding ?? m.left
  const sidebarEl = (
    <div style={{ width: `${sidebarWidth}%`, flexShrink: 0, ...(sidebarBg ? { backgroundColor: sidebarBg, margin: `-${m.top}px 0 -${m.bottom}px -${m.left}px`, padding: `${m.top}px ${sp}px ${m.bottom}px ${m.left}px` } : { paddingRight: gap }) }}>
      {sidebar}
    </div>
  )
  const mainEl = (
    <div style={{ flex: 1, minWidth: 0 }}>
      {main}
    </div>
  )
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", display: "flex", padding: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px` }}>
      {sidebarPosition === "left" ? (<>{sidebarEl}{mainEl}</>) : (<>{mainEl}{sidebarEl}</>)}
    </div>
  )
}
