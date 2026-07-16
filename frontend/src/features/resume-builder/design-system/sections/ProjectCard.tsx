"use client"
import type { ProjectItem as ProjectItemType } from "@/types/resume"

type ProjectCardProps = {
  item: ProjectItemType
  variant?: "standard" | "compact" | "detailed"
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string }
}

const d = { primary: "#1e3a5f", text: "#111827", secondary: "#374151", muted: "#6b7280" }

export function ProjectCard({ item, variant = "standard", colors = {} }: ProjectCardProps) {
  const c = { ...d, ...colors }
  const dateRange = [item.startDate, item.endDate].filter(Boolean).join(" — ")

  if (variant === "compact") {
    return (
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.text }}>{item.name}</p>
          {dateRange && <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>}
        </div>
        {item.role && <p style={{ margin: "1px 0 0", fontSize: 10, color: c.primary }}>{item.role}</p>}
        {item.bullets.length > 0 && (
          <p style={{ margin: "3px 0 0", fontSize: 10, color: c.secondary, lineHeight: 1.5 }}>{item.bullets.join(" · ")}</p>
        )}
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <div style={{ marginBottom: 8, borderLeft: `2px solid ${c.primary}20`, paddingLeft: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.text }}>{item.name}</p>
          {dateRange && <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>}
        </div>
        {item.role && <p style={{ margin: "1px 0 0", fontSize: 10, color: c.primary }}>{item.role}</p>}
        {item.url && <p style={{ margin: "1px 0 0", fontSize: 9, color: c.muted }}>{item.url}</p>}
        {item.bullets.length > 0 && (
          <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 10, color: c.secondary, lineHeight: 1.55 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  // standard
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.text }}>{item.name}</p>
        {dateRange && <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>}
      </div>
      {item.role && <p style={{ margin: "1px 0 0", fontSize: 10, color: c.primary }}>{item.role}</p>}
      {item.bullets.length > 0 && (
        <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 10, color: c.secondary, lineHeight: 1.55 }}>
          {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
        </ul>
      )}
    </div>
  )
}
