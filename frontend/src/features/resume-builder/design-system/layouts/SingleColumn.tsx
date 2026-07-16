"use client"
import type { ReactNode } from "react"

type SingleColumnProps = {
  children: ReactNode
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
}

export function SingleColumn({ children, margin }: SingleColumnProps) {
  const m = { top: 32, right: 32, bottom: 32, left: 32, ...margin }
  return (
    <div style={{ width: 794, minHeight: 1123, backgroundColor: "#ffffff", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", lineHeight: 1.4, color: "#333333", padding: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px` }}>
      {children}
    </div>
  )
}
