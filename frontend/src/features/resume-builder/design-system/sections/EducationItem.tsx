"use client"
import type { EducationItem as EducationItemType } from "@/types/resume"

type EducationItemProps = {
  item: EducationItemType
  variant?: string
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string }
  compact?: boolean
}

const d = { primary: "#2563EB", text: "#111827", secondary: "#4B5563", muted: "#6B7280" }

export function EducationItem({ item, variant = "standard", colors = {}, compact }: EducationItemProps) {
  const c = { ...d, ...colors }
  const dateRange = [item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" \u2013 ")

  if (variant === "compact") {
    return (
      <div style={{ marginBottom: compact ? 8 : 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>
            {item.degree}{item.field ? ` in ${item.field}` : ""}
          </p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400 }}>{dateRange}</span>
        </div>
        <p style={{ margin: "3px 0 0", fontSize: 10.5, color: c.primary, fontWeight: 500 }}>{item.institution}</p>
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <div style={{ marginBottom: compact ? 10 : 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>{item.institution}</p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400 }}>{dateRange}</span>
        </div>
        <p style={{ margin: "3px 0 0", fontSize: 10.5, color: c.primary, fontWeight: 500 }}>
          {item.degree}{item.field ? ` in ${item.field}` : ""}
        </p>
        {item.gpa && <p style={{ margin: "2px 0 0", fontSize: 9.5, color: c.muted }}>GPA: {item.gpa}</p>}
      </div>
    )
  }

  if (variant === "timeline") {
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: compact ? 10 : 12, alignItems: "flex-start" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: c.primary, flexShrink: 0, marginTop: 4 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>
              {item.degree}{item.field ? ` in ${item.field}` : ""}
            </p>
            <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400 }}>{dateRange}</span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 10.5, color: c.primary, fontWeight: 500 }}>{item.institution}</p>
          {item.gpa && <p style={{ margin: "2px 0 0", fontSize: 9.5, color: c.muted }}>GPA: {item.gpa}</p>}
        </div>
      </div>
    )
  }

  if (variant === "magazine") {
    return (
      <div style={{ marginBottom: compact ? 10 : 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: c.text, lineHeight: 1.25 }}>{item.institution}</p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400 }}>{dateRange}</span>
        </div>
        <p style={{ margin: "3px 0 0", fontSize: 10.5, color: c.primary, fontWeight: 500, fontStyle: "italic" }}>
          {item.degree}{item.field ? ` in ${item.field}` : ""}
        </p>
        {item.gpa && <p style={{ margin: "2px 0 0", fontSize: 9.5, color: c.muted }}>GPA: {item.gpa}</p>}
      </div>
    )
  }

  // standard
  return (
    <div style={{ marginBottom: compact ? 8 : 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: c.text }}>{item.institution}</span>
        <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400 }}>{dateRange}</span>
      </div>
      <p style={{ margin: "3px 0 0", fontSize: 10.5, color: c.secondary }}>
        {item.degree}{item.field ? ` in ${item.field}` : ""}
        {item.gpa ? ` \u00b7 GPA: ${item.gpa}` : ""}
      </p>
    </div>
  )
}
