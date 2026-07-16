"use client"

type DividerProps = {
  variant?: "thin" | "accent" | "thick" | "none"
  color?: string
  spacing?: number
}

export function Divider({ variant = "thin", color = "#e5e7eb", spacing = 8 }: DividerProps) {
  if (variant === "none") return null
  if (variant === "accent") {
    return <div style={{ height: 1.5, backgroundColor: color, marginBottom: spacing, marginTop: spacing, opacity: 0.5 }} />
  }
  if (variant === "thick") {
    return <div style={{ height: 2, backgroundColor: color, marginBottom: spacing, marginTop: spacing }} />
  }
  // thin
  return <div style={{ height: 0.5, backgroundColor: color, marginBottom: spacing, marginTop: spacing }} />
}
