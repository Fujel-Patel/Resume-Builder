"use client"
import type { ExperienceItem as ExperienceItemType } from "@/types/resume"

type ExperienceItemProps = {
  item: ExperienceItemType
  variant?: string
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string }
  showLocation?: boolean
  compact?: boolean
}

const d = { primary: "#2563EB", text: "#111827", secondary: "#4B5563", muted: "#6B7280" }

export function ExperienceItem({ item, variant = "bullets", colors = {}, showLocation = true, compact }: ExperienceItemProps) {
  const c = { ...d, ...colors }
  const dateRange = [item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" \u2013 ")

  if (variant === "compact") {
    return (
      <div style={{ marginBottom: compact ? 6 : 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>{item.role}</p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 400 }}>{dateRange}</span>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: c.primary, fontWeight: 600 }}>{item.company}{showLocation && item.location ? `, ${item.location}` : ""}</p>
        {item.bullets.length > 0 && (
          <ul style={{ margin: "5px 0 0", paddingLeft: 14, fontSize: 10.5, color: c.secondary, lineHeight: 1.5 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  if (variant === "role-first") {
    return (
      <div style={{ marginBottom: compact ? 12 : 16 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>{item.role}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginTop: 2 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: c.primary, fontWeight: 600 }}>{item.company}{showLocation && item.location ? ` \u00b7 ${item.location}` : ""}</p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400 }}>{dateRange}</span>
        </div>
        {item.bullets.length > 0 && (
          <ul style={{ margin: "5px 0 0", paddingLeft: 14, fontSize: 10.5, color: c.secondary, lineHeight: 1.5 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: compact ? 2 : 3 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  if (variant === "timeline") {
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: compact ? 12 : 16 }}>
        {/* Timeline axis */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12, flexShrink: 0, paddingTop: 4 }}>
          <div style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: c.primary,
            flexShrink: 0,
          }} />
          <div style={{
            flex: 1,
            width: 1,
            backgroundColor: "#E5E7EB",
            marginTop: 4,
          }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>{item.role}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginTop: 2 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: c.primary, fontWeight: 600 }}>{item.company}</p>
            <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400 }}>{dateRange}</span>
          </div>
          {showLocation && item.location && (
            <p style={{ margin: "2px 0 0", fontSize: 9.5, color: c.muted }}>{item.location}</p>
          )}
          {item.bullets.length > 0 && (
            <ul style={{ margin: "5px 0 0", paddingLeft: 14, fontSize: 10.5, color: c.secondary, lineHeight: 1.5 }}>
              {item.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: compact ? 2 : 3 }}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  }

  if (variant === "cards") {
    return (
      <div style={{ marginBottom: compact ? 8 : 14, border: `1px solid ${c.primary}15`, borderRadius: 4, padding: "12px 14px", backgroundColor: "#fafbfc" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>{item.role}</p>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400 }}>{dateRange}</span>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: c.primary, fontWeight: 600 }}>{item.company}{showLocation && item.location ? ` \u00b7 ${item.location}` : ""}</p>
        {item.bullets.length > 0 && (
          <ul style={{ margin: "5px 0 0", paddingLeft: 14, fontSize: 10.5, color: c.secondary, lineHeight: 1.5 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: compact ? 2 : 3 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  if (variant === "magazine") {
    return (
      <div style={{ marginBottom: compact ? 14 : 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: c.text, lineHeight: 1.25, letterSpacing: "-0.01em" }}>{item.role}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, fontWeight: 600, color: c.primary, lineHeight: 1.3 }}>{item.company}{showLocation && item.location ? ` \u00b7 ${item.location}` : ""}</p>
          </div>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400, flexShrink: 0, paddingTop: 2 }}>{dateRange}</span>
        </div>
        {item.bullets.length > 0 && (
          <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 10.5, color: c.secondary, lineHeight: 1.5 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: compact ? 2 : 3 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  if (variant === "executive") {
    return (
      <div style={{ marginBottom: compact ? 14 : 18, paddingBottom: compact ? 12 : 16, borderBottom: `1px solid ${c.primary}15` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: c.text, lineHeight: 1.25 }}>{item.role}</p>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, fontWeight: 600, color: c.primary, lineHeight: 1.3 }}>{item.company}{showLocation && item.location ? ` \u2014 ${item.location}` : ""}</p>
          </div>
          <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400, flexShrink: 0 }}>{dateRange}</span>
        </div>
        {item.bullets.length > 0 && (
          <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 10.5, color: c.secondary, lineHeight: 1.5 }}>
            {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: compact ? 2 : 3 }}>{b}</li>)}
          </ul>
        )}
      </div>
    )
  }

  // bullets (default)
  return (
    <div style={{ marginBottom: compact ? 10 : 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{item.role}</span>
        </div>
        <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap", fontWeight: 400 }}>{dateRange}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: c.primary }}>{item.company}</span>
        {showLocation && item.location && <span style={{ fontSize: 9.5, color: c.muted }}> \u00b7 {item.location}</span>}
      </div>
      {item.bullets.length > 0 && (
        <ul style={{ margin: "5px 0 0", paddingLeft: 14, fontSize: 10.5, color: c.secondary, lineHeight: 1.5 }}>
          {item.bullets.map((b, i) => <li key={i} style={{ marginBottom: compact ? 2 : 3 }}>{b}</li>)}
        </ul>
      )}
    </div>
  )
}
