"use client"
import type { ExperienceItem as ExperienceItemType } from "@/types/resume"

type ExperienceItemProps = {
  item: ExperienceItemType
  variant?: "bullets" | "timeline" | "cards" | "compact" | "role-first"
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string }
  showLocation?: boolean
}

const d = { primary: "#1e3a5f", text: "#111827", secondary: "#374151", muted: "#6b7280" }

export function ExperienceItem({ item, variant = "bullets", colors = {}, showLocation = true }: ExperienceItemProps) {
  const c = { ...d, ...colors }
  const dateRange = [item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" — ")

  if (variant === "compact") {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.text }}>{item.role}</p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", flexShrink: 0 }}>{dateRange}</span>
        </div>
        <p style={{ margin: 0, fontSize: 10, color: c.secondary }}>{item.company}{showLocation && item.location ? `, ${item.location}` : ""}</p>
        {item.bullets.length > 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 10, color: c.secondary, lineHeight: 1.5 }}>{item.bullets.join(" · ")}</p>
        )}
      </div>
    )
  }

  if (variant === "role-first") {
    return (
      <div style={{ marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: c.text }}>{item.role}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginTop: 1 }}>
          <p style={{ margin: 0, fontSize: 10, color: c.primary }}>{item.company}{showLocation && item.location ? ` · ${item.location}` : ""}</p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>
        </div>
        {item.bullets.length > 0 && (
          <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 10, color: c.secondary, lineHeight: 1.55 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  if (variant === "timeline") {
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12, flexShrink: 0, paddingTop: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: c.primary, flexShrink: 0 }} />
          <div style={{ flex: 1, width: 1.5, backgroundColor: c.muted + "40", marginTop: 4 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.text }}>{item.role}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginTop: 1 }}>
            <p style={{ margin: 0, fontSize: 10, color: c.primary }}>{item.company}</p>
            <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>
          </div>
          {showLocation && item.location && <p style={{ margin: "1px 0 0", fontSize: 9, color: c.muted }}>{item.location}</p>}
          {item.bullets.length > 0 && (
            <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 10, color: c.secondary, lineHeight: 1.55 }}>
              {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
            </ul>
          )}
        </div>
      </div>
    )
  }

  if (variant === "cards") {
    return (
      <div style={{ marginBottom: 8, border: `1px solid ${c.muted}30`, borderRadius: 4, padding: "8px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.text }}>{item.role}</p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>
        </div>
        <p style={{ margin: "1px 0 0", fontSize: 10, color: c.primary }}>{item.company}{showLocation && item.location ? ` · ${item.location}` : ""}</p>
        {item.bullets.length > 0 && (
          <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 10, color: c.secondary, lineHeight: 1.55 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  // bullets (default)
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{item.company}</span>
          {showLocation && item.location && <span style={{ fontSize: 9, color: c.muted }}> — {item.location}</span>}
        </div>
        <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{dateRange}</span>
      </div>
      <p style={{ margin: "1px 0 0", fontSize: 10, fontWeight: 500, color: c.primary }}>{item.role}</p>
      {item.bullets.length > 0 && (
        <ul style={{ margin: "4px 0 0", paddingLeft: 14, fontSize: 10, color: c.secondary, lineHeight: 1.55 }}>
          {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: 1 }}>{b}</li>)}
        </ul>
      )}
    </div>
  )
}
