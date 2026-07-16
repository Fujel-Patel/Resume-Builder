"use client"
import type { ReactNode } from "react"

type SectionHeaderProps = {
  title: string
  variant?: "underline" | "border" | "filled" | "minimal" | "accent-line" | "two-tone" | "icon-left" | "sidebar"
  colors?: { primary?: string; text?: string; muted?: string; border?: string }
  typography?: { fontSize?: number; fontWeight?: number; letterSpacing?: string; textTransform?: string }
  icon?: ReactNode
}

const defaults = { primary: "#1e3a5f", text: "#111827", muted: "#6b7280", border: "#e5e7eb" }

export function SectionHeader({ title, variant = "underline", colors = {}, typography = {}, icon }: SectionHeaderProps) {
  const c = { ...defaults, ...colors }
  const base = { fontSize: typography.fontSize ?? 11, fontWeight: typography.fontWeight ?? 700, letterSpacing: typography.letterSpacing ?? "0.08em", textTransform: (typography.textTransform ?? "uppercase") as "uppercase" }

  if (variant === "underline") {
    return (
      <div style={{ borderBottom: `1px solid ${c.border}`, paddingBottom: 4, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {icon && <span style={{ color: c.primary, flexShrink: 0 }}>{icon}</span>}
          <h2 style={{ ...base, color: c.text, margin: 0 }}>{title}</h2>
        </div>
      </div>
    )
  }
  if (variant === "border") {
    return (
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ ...base, color: c.text, margin: 0, display: "inline-block", border: `1.5px solid ${c.text}`, padding: "2px 8px" }}>{title}</h2>
      </div>
    )
  }
  if (variant === "filled") {
    return (
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ ...base, color: c.primary.startsWith("#fff") || c.primary === "#ffffff" ? c.text : "#fff", margin: 0, display: "inline-block", backgroundColor: c.primary, padding: "3px 10px" }}>{title}</h2>
      </div>
    )
  }
  if (variant === "minimal") {
    return (
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ ...base, fontSize: (typography.fontSize ?? 11) - 1, color: c.muted, margin: 0, letterSpacing: "0.12em" }}>{title}</h2>
      </div>
    )
  }
  if (variant === "accent-line") {
    return (
      <div style={{ marginBottom: 8, borderLeft: `3px solid ${c.primary}`, paddingLeft: 8 }}>
        <h2 style={{ ...base, color: c.text, margin: 0 }}>{title}</h2>
      </div>
    )
  }
  if (variant === "two-tone") {
    return (
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <h2 style={{ ...base, color: c.primary, margin: 0 }}>{title}</h2>
        <div style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      </div>
    )
  }
  if (variant === "icon-left") {
    return (
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        {icon && <span style={{ color: c.primary, flexShrink: 0, fontSize: 12 }}>{icon}</span>}
        <h2 style={{ ...base, color: c.text, margin: 0 }}>{title}</h2>
      </div>
    )
  }
  // sidebar
  return (
    <div style={{ marginBottom: 6 }}>
      <h2 style={{ ...base, fontSize: 9, color: c.primary, margin: 0, letterSpacing: "0.15em" }}>{title}</h2>
      <div style={{ width: 20, height: 2, backgroundColor: c.primary, marginTop: 4, borderRadius: 1 }} />
    </div>
  )
}
