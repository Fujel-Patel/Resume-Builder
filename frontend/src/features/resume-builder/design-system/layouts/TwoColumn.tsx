"use client"
import type { ReactNode } from "react"

type TwoColumnProps = {
  left: ReactNode
  right: ReactNode
  leftWidth?: number
  gap?: number
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  sidebarBg?: string
}

export function TwoColumn({ left, right, leftWidth = 30, gap = 24, margin, sidebarBg }: TwoColumnProps) {
  const m = { top: 32, right: 32, bottom: 32, left: 32, ...margin }
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", display: "flex", padding: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px` }}>
      <div style={{ width: `${leftWidth}%`, flexShrink: 0, paddingRight: gap, ...(sidebarBg ? { backgroundColor: sidebarBg, margin: `-${m.top}px ${-(gap/2)}px -${m.bottom}px -${m.left}px`, paddingLeft: m.left, paddingRight: m.left + gap, paddingTop: m.top, paddingBottom: m.bottom } : {}) }}>
        {left}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {right}
      </div>
    </div>
  )
}
