"use client"

type SummarySectionProps = {
  text: string
  colors?: { text?: string; secondary?: string }
  typography?: { fontSize?: number; lineHeight?: number }
}

const d = { text: "#111827", secondary: "#374151" }

export function SummarySection({ text, colors = {}, typography = {} }: SummarySectionProps) {
  const c = { ...d, ...colors }
  if (!text) return null
  return (
    <p style={{ margin: 0, fontSize: typography.fontSize ?? 10, lineHeight: typography.lineHeight ?? 1.55, color: c.secondary }}>
      {text}
    </p>
  )
}
