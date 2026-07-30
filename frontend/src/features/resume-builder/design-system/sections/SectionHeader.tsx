"use client"
import type { ReactNode } from "react"

type SectionHeaderProps = {
  title: string
  variant?: string
  colors?: { primary?: string; text?: string; muted?: string; border?: string }
  typography?: { fontSize?: number; fontWeight?: number; letterSpacing?: string; textTransform?: string }
  icon?: ReactNode
  number?: number
  compact?: boolean
}

const defaults = { primary: "#2563EB", text: "#111827", muted: "#6B7280", border: "#E5E7EB" }

export function SectionHeader({ title, variant = "underline", colors = {}, typography = {}, icon, number, compact }: SectionHeaderProps) {
  const c = { ...defaults, ...colors }
  const base = {
    fontSize: typography.fontSize ?? 15,
    fontWeight: typography.fontWeight ?? 700,
    letterSpacing: typography.letterSpacing ?? "0.08em",
    textTransform: (typography.textTransform ?? "uppercase") as "uppercase",
  }
  const mb = compact ? 8 : 10

  if (variant === "underline") {
    return (
      <div style={{ marginBottom: mb }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {icon && <span style={{ color: c.primary, flexShrink: 0, fontSize: 13 }}>{icon}</span>}
          <h2 style={{ ...base, color: c.text, margin: 0 }}>{title}</h2>
        </div>
        <div style={{ height: 2, backgroundColor: c.primary, marginTop: compact ? 4 : 5, borderRadius: 1 }} />
      </div>
    )
  }

  if (variant === "border") {
    return (
      <div style={{ marginBottom: mb }}>
        <h2 style={{ ...base, color: c.text, margin: 0, display: "inline-block", border: `2px solid ${c.text}`, padding: "3px 10px" }}>{title}</h2>
      </div>
    )
  }

  if (variant === "filled") {
    return (
      <div style={{ marginBottom: mb }}>
        <h2 style={{ ...base, color: c.primary.startsWith("#fff") || c.primary === "#ffffff" ? c.text : "#fff", margin: 0, display: "inline-block", backgroundColor: c.primary, padding: "4px 14px", borderRadius: 2 }}>{title}</h2>
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <div style={{ marginBottom: mb }}>
        <h2 style={{ ...base, fontSize: (typography.fontSize ?? 13) - 2, color: c.muted, margin: 0, letterSpacing: "0.14em" }}>{title}</h2>
      </div>
    )
  }

  if (variant === "accent-line") {
    return (
      <div style={{ marginBottom: mb, borderLeft: `3px solid ${c.primary}`, paddingLeft: 10 }}>
        <h2 style={{ ...base, color: c.text, margin: 0 }}>{title}</h2>
      </div>
    )
  }

  if (variant === "two-tone") {
    return (
      <div style={{ marginBottom: mb, display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ ...base, color: c.primary, margin: 0 }}>{title}</h2>
        <div style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      </div>
    )
  }

  if (variant === "icon-left") {
    return (
      <div style={{ marginBottom: mb, display: "flex", alignItems: "center", gap: 7 }}>
        {icon && <span style={{ color: c.primary, flexShrink: 0, fontSize: 13 }}>{icon}</span>}
        <h2 style={{ ...base, color: c.text, margin: 0 }}>{title}</h2>
      </div>
    )
  }

  if (variant === "editorial") {
    return (
      <div style={{ marginBottom: compact ? 10 : 12, display: "flex", alignItems: "baseline", gap: 10 }}>
        <h2 style={{ ...base, fontSize: (typography.fontSize ?? 15) + 2, fontWeight: 800, color: c.primary, margin: 0, letterSpacing: "-0.01em", textTransform: "none" as const }}>{title}</h2>
        <div style={{ flex: 1, height: 2.5, backgroundColor: c.primary, borderRadius: 1 }} />
      </div>
    )
  }

  if (variant === "centered") {
    return (
      <div style={{ marginBottom: mb, textAlign: "center" as const, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 0.75, backgroundColor: c.border }} />
        <h2 style={{ ...base, color: c.primary, margin: 0, whiteSpace: "nowrap" as const }}>{title}</h2>
        <div style={{ flex: 1, height: 0.75, backgroundColor: c.border }} />
      </div>
    )
  }

  if (variant === "numbered") {
    return (
      <div style={{ marginBottom: mb, display: "flex", alignItems: "center", gap: 8 }}>
        {number != null && (
          <span style={{ fontSize: 18, fontWeight: 800, color: c.primary + "25", lineHeight: 1, fontVariantNumeric: "tabular-nums" as const }}>
            {String(number).padStart(2, "0")}
          </span>
        )}
        <h2 style={{ ...base, color: c.text, margin: 0 }}>{title}</h2>
        <div style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      </div>
    )
  }

  // sidebar variant — used for sidebar sections
  return (
    <div style={{ marginBottom: compact ? 6 : 8 }}>
      <h2 style={{ ...base, fontSize: 11, color: c.primary, margin: 0, letterSpacing: "0.12em" }}>{title}</h2>
      <div style={{ width: 20, height: 2, backgroundColor: c.primary, marginTop: 4, borderRadius: 1 }} />
    </div>
  )
}
