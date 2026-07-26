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

export function OffsetSidebar({ topBar, sidebar, main, sidebarWidth = 28, sidebarBg = "#f8fafc", gap = 20, margin, compact }: OffsetSidebarProps) {
  const m = { top: 28, right: 28, bottom: 28, left: 28, ...margin }
  const sidebarPad = compact ? 14 : 16

  return (
    <div style={{
      width: 794,
      minHeight: 1123,
      backgroundColor: "#ffffff",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      lineHeight: 1.4,
      color: "#111827",
      boxSizing: "border-box" as const,
    }}>
      {/* Header zone: name + title + contact */}
      <div style={{
        padding: compact
          ? `${m.top + 8}px ${m.right}px 12px ${m.left}px`
          : `${m.top + 12}px ${m.right}px 16px ${m.left}px`,
      }}>
        {topBar}
      </div>

      {/* Thin divider between header and body */}
      <div style={{
        height: 1,
        backgroundColor: "#E5E7EB",
        marginLeft: m.left,
        marginRight: m.right,
      }} />

      {/* Body zone: sidebar + main */}
      <div style={{
        display: "flex",
        padding: `0 ${m.right}px ${m.bottom}px ${m.left}px`,
        gap,
        alignItems: "flex-start",
      }}>
        {/* Sidebar panel */}
        <div style={{
          width: `${sidebarWidth}%`,
          flexShrink: 0,
          backgroundColor: sidebarBg,
          borderRadius: 3,
          padding: `${sidebarPad}px`,
          marginTop: compact ? 12 : 16,
        }}>
          {sidebar}
        </div>

        {/* Main content */}
        <div style={{
          flex: 1,
          minWidth: 0,
          paddingTop: compact ? 12 : 16,
        }}>
          {main}
        </div>
      </div>
    </div>
  )
}
