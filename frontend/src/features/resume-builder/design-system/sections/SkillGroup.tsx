"use client"
import type { SkillGroup as SkillGroupType } from "@/types/resume"

type SkillGroupProps = {
  skills: SkillGroupType[]
  variant?: string
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string; border?: string }
  columns?: 1 | 2 | 3
}

const d = { primary: "#1e3a5f", text: "#111827", secondary: "#374151", muted: "#6b7280", border: "#e5e7eb" }

export function SkillGroup({ skills, variant = "grouped", colors = {}, columns = 2 }: SkillGroupProps) {
  const c = { ...d, ...colors }
  const hasNamed = skills.some(g => g.name)

  if (variant === "list" || variant === "grouped") {
    if (!hasNamed) {
      const all = skills.flatMap(g => g.skills)
      return <p style={{ margin: 0, fontSize: 10.5, color: c.secondary, lineHeight: 1.6 }}>{all.join(", ")}</p>
    }
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "6px 20px" }}>
        {skills.map(g => (
          <div key={g.id} style={{ fontSize: 10.5, color: c.muted, lineHeight: 1.6, minWidth: 0 }}>
            {g.name ? (
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: 600, color: c.text }}>{g.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                {g.skills.length > 0 && <span style={{ color: c.muted }}>{"\u00a0\u2014\u00a0"}{g.skills.join(", ")}</span>}
              </p>
            ) : (
              <p style={{ margin: 0 }}>{g.skills.join(", ")}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (variant === "tags") {
    const all = skills.flatMap(g => g.skills)
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {all.map(s => (
          <span key={s} style={{ fontSize: 9.5, color: c.text, border: `1px solid ${c.border}`, borderRadius: 3, padding: "2px 8px", lineHeight: 1.5, fontWeight: 500 }}>{s}</span>
        ))}
      </div>
    )
  }

  if (variant === "pills") {
    const all = skills.flatMap(g => g.skills)
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {all.map(s => (
          <span key={s} style={{ fontSize: 9.5, color: c.primary, backgroundColor: c.primary + "10", borderRadius: 99, padding: "3px 10px", lineHeight: 1.5, fontWeight: 500 }}>{s}</span>
        ))}
      </div>
    )
  }

  if (variant === "three-column") {
    const all = skills.flatMap(g => g.skills)
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 12px", fontSize: 10, color: c.secondary }}>
        {all.map(s => (
          <span key={s} style={{ lineHeight: 1.6 }}>{s}</span>
        ))}
      </div>
    )
  }

  if (variant === "matrix") {
    const all = skills.flatMap(g => g.skills)
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(columns, 3)}, 1fr)`, gap: 0, border: `1px solid ${c.border}`, borderRadius: 3, overflow: "hidden" }}>
        {all.map((s, i) => (
          <span key={s} style={{ fontSize: 9.5, padding: "3px 8px", color: c.secondary, borderRight: (i + 1) % 3 !== 0 ? `1px solid ${c.border}` : "none", borderBottom: `1px solid ${c.border}`, lineHeight: 1.5 }}>{s}</span>
        ))}
      </div>
    )
  }

  if (variant === "progress") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "5px 20px" }}>
        {skills.map(g => (
          <div key={g.id} style={{ fontSize: 10, minWidth: 0 }}>
            {g.name && <p style={{ margin: "0 0 2px", fontWeight: 600, color: c.text, fontSize: 9.5, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{g.name}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {g.skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ flex: 1, color: c.secondary, lineHeight: 1.5 }}>{s}</span>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(dot => (
                      <span key={dot} style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: dot <= 4 ? c.primary : c.border, display: "inline-block" }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // categories
  if (!hasNamed) {
    const all = skills.flatMap(g => g.skills)
    return <p style={{ margin: 0, fontSize: 10.5, color: c.secondary, lineHeight: 1.6 }}>{all.join(", ")}</p>
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "6px 20px" }}>
      {skills.map(g => (
        <div key={g.id} style={{ fontSize: 10.5, lineHeight: 1.6, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, color: c.primary, fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {g.name?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </p>
          <p style={{ margin: "2px 0 0", color: c.muted }}>{g.skills.join(", ")}</p>
        </div>
      ))}
    </div>
  )
}
