"use client"

type SummarySectionProps = {
  text: string
  variant?: string
  colors?: { text?: string; secondary?: string; primary?: string; muted?: string; border?: string }
  typography?: { fontSize?: number; lineHeight?: number }
  compact?: boolean
}

const d = { text: "#111827", secondary: "#4B5563", primary: "#2563EB", muted: "#6B7280", border: "#E5E7EB" }

export function SummarySection({ text, variant = "standard", colors = {}, typography = {} }: SummarySectionProps) {
  const c = { ...d, ...colors }
  if (!text) return null

  if (variant === "highlight") {
    return (
      <div style={{ padding: "8px 12px", backgroundColor: c.primary + "08", borderLeft: `3px solid ${c.primary}`, borderRadius: "0 4px 4px 0", marginBottom: 2 }}>
        <p style={{ margin: 0, fontSize: typography.fontSize ?? 10.5, lineHeight: typography.lineHeight ?? 1.5, color: c.secondary, letterSpacing: "0.01em" }}>
          {text}
        </p>
      </div>
    )
  }

  if (variant === "editorial") {
    return (
      <div style={{ position: "relative" as const, paddingLeft: 18, marginBottom: 2 }}>
        <span style={{ position: "absolute" as const, left: 0, top: -4, fontSize: 28, fontWeight: 800, color: c.primary + "20", lineHeight: 1, fontFamily: "Georgia, serif" }}>&ldquo;</span>
        <p style={{ margin: 0, fontSize: (typography.fontSize ?? 10.5) + 0.5, lineHeight: typography.lineHeight ?? 1.5, color: c.secondary, letterSpacing: "0.005em", fontStyle: "italic" as const }}>
          {text}
        </p>
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <p style={{ margin: 0, fontSize: (typography.fontSize ?? 10.5) - 0.5, lineHeight: typography.lineHeight ?? 1.45, color: c.muted, letterSpacing: "0.01em" }}>
        {text}
      </p>
    )
  }

  // standard
  return (
    <p style={{ margin: 0, fontSize: typography.fontSize ?? 10.5, lineHeight: typography.lineHeight ?? 1.5, color: c.secondary, letterSpacing: "0.01em" }}>
      {text}
    </p>
  )
}
