"use client"
import type { EducationItem as EducationItemType } from "@/types/resume"

type EducationItemProps = {
  item: EducationItemType
  variant?: "standard" | "compact" | "detailed"
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string }
}

const d = { primary: "#1e3a5f", text: "#111827", secondary: "#374151", muted: "#6b7280" }

export function EducationItem({ item, variant = "standard", colors = {} }: EducationItemProps) {
  const c = { ...d, ...colors }
  const dateRange = [item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" — ")

  if (variant === "compact") {
    return (
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.text }}>
            {item.degree}{item.field ? ` in ${item.field}` : ""}
          </p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>
        </div>
        <p style={{ margin: "1px 0 0", fontSize: 10, color: c.secondary }}>{item.institution}</p>
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.text }}>{item.institution}</p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>
        </div>
        <p style={{ margin: "1px 0 0", fontSize: 10, color: c.primary }}>
          {item.degree}{item.field ? ` in ${item.field}` : ""}
        </p>
        {item.gpa && <p style={{ margin: "2px 0 0", fontSize: 9, color: c.muted }}>GPA: {item.gpa}</p>}
      </div>
    )
  }

  // standard
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{item.institution}</span>
        </div>
        <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>
      </div>
      <p style={{ margin: "1px 0 0", fontSize: 10, color: c.secondary }}>
        {item.degree}{item.field ? ` in ${item.field}` : ""}
        {item.gpa ? ` · GPA: ${item.gpa}` : ""}
      </p>
    </div>
  )
}
