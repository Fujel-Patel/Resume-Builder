"use client"
import type { ReactNode } from "react"

type HeroBannerProps = {
  header: ReactNode
  children: ReactNode
  headerBg?: string
  headerTextColor?: string
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  padding?: number
  compact?: boolean
}

export function HeroBanner({ header, children, headerBg = "#1e3a5f", headerTextColor = "#ffffff", margin, padding, compact }: HeroBannerProps) {
  const m = { top: 0, right: 0, bottom: 0, left: 0, ...margin }
  const h = padding ?? 40
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", boxSizing: "border-box" as const }}>
      <div style={{ backgroundColor: headerBg, color: headerTextColor, padding: compact ? `18px ${h}px 14px ${h}px` : `32px ${h}px 24px ${h}px` }}>
        {header}
      </div>
      <div style={{ padding: compact ? `14px ${h}px 18px ${h}px` : `24px ${h}px 36px ${h}px` }}>
        {children}
      </div>
    </div>
  )
}
