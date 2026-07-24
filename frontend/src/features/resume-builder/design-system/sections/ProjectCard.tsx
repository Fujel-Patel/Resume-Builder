"use client"
import type { ProjectItem as ProjectItemType } from "@/types/resume"

type ProjectCardProps = {
  item: ProjectItemType
  variant?: string
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string }
  compact?: boolean
}

const d = { primary: "#1e3a5f", text: "#111827", secondary: "#374151", muted: "#6b7280" }

export function ProjectCard({ item, variant = "standard", colors = {}, compact }: ProjectCardProps) {
  const c = { ...d, ...colors }
  const dateRange = [item.startDate, item.endDate].filter(Boolean).join(" \u2014 ")

  if (variant === "compact") {
    return (
      <div style={{ marginBottom: compact ? 5 : 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>{item.name}</p>
          {dateRange && <span style={{ fontSize: 9.5, color: c.muted, whiteSpace: "nowrap", fontWeight: 500 }}>{dateRange}</span>}
        </div>
        {item.role && <p style={{ margin: "2px 0 0", fontSize: 10, color: c.primary, fontWeight: 500 }}>{item.role}</p>}
        {item.bullets.length > 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 10, color: c.secondary, lineHeight: 1.6 }}>{item.bullets.join(" \u00b7 ")}</p>
        )}
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <div style={{ marginBottom: compact ? 7 : 10, borderLeft: `2px solid ${c.primary}25`, paddingLeft: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>{item.name}</p>
          {dateRange && <span style={{ fontSize: 9.5, color: c.muted, whiteSpace: "nowrap", fontWeight: 500 }}>{dateRange}</span>}
        </div>
        {item.role && <p style={{ margin: "2px 0 0", fontSize: 10, color: c.primary, fontWeight: 500 }}>{item.role}</p>}
        {item.url && <p style={{ margin: "2px 0 0", fontSize: 9.5, color: c.muted }}>{item.url}</p>}
        {item.bullets.length > 0 && (
          <ul style={{ margin: "5px 0 0", paddingLeft: 14, fontSize: 10, color: c.secondary, lineHeight: 1.6 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: compact ? 1 : 2 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div style={{ marginBottom: compact ? 7 : 10, border: `1px solid ${c.primary}18`, borderRadius: 4, padding: "8px 12px", backgroundColor: "#fafbfc" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>{item.name}</p>
          {dateRange && <span style={{ fontSize: 9.5, color: c.muted, whiteSpace: "nowrap", fontWeight: 500 }}>{dateRange}</span>}
        </div>
        {item.role && <p style={{ margin: "2px 0 0", fontSize: 10, color: c.primary, fontWeight: 500 }}>{item.role}</p>}
        {item.url && <p style={{ margin: "2px 0 0", fontSize: 9.5, color: c.muted }}>{item.url}</p>}
        {item.bullets.length > 0 && (
          <ul style={{ margin: "5px 0 0", paddingLeft: 14, fontSize: 10.5, color: c.secondary, lineHeight: 1.6 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: compact ? 1 : 3 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  if (variant === "featured") {
    return (
      <div style={{ marginBottom: compact ? 8 : 12, backgroundColor: c.primary + "08", borderLeft: `3px solid ${c.primary}`, borderRadius: "0 4px 4px 0", padding: "8px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>{item.name}</p>
          {dateRange && <span style={{ fontSize: 9.5, color: c.muted, whiteSpace: "nowrap", fontWeight: 500 }}>{dateRange}</span>}
        </div>
        {item.role && <p style={{ margin: "2px 0 0", fontSize: 10.5, fontWeight: 500, color: c.primary }}>{item.role}</p>}
        {item.url && <p style={{ margin: "2px 0 0", fontSize: 9.5, color: c.muted }}>{item.url}</p>}
        {item.bullets.length > 0 && (
          <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 10.5, color: c.secondary, lineHeight: 1.65 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: compact ? 1 : 3 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  // standard
  return (
    <div style={{ marginBottom: compact ? 5 : 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>{item.name}</p>
        {dateRange && <span style={{ fontSize: 9.5, color: c.muted, whiteSpace: "nowrap", fontWeight: 500 }}>{dateRange}</span>}
      </div>
      {item.role && <p style={{ margin: "2px 0 0", fontSize: 10, color: c.primary, fontWeight: 500 }}>{item.role}</p>}
      {item.bullets.length > 0 && (
        <ul style={{ margin: "5px 0 0", paddingLeft: 14, fontSize: 10, color: c.secondary, lineHeight: 1.6 }}>
          {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: compact ? 1 : 2 }}>{b}</li>)}
        </ul>
      )}
    </div>
  )
}
