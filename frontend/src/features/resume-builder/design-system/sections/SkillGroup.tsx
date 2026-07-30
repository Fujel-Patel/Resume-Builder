"use client"
import type { SkillGroup as SkillGroupType } from "@/types/resume"

type SkillGroupProps = {
  skills: SkillGroupType[]
  variant?: string
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string; border?: string }
  columns?: 1 | 2 | 3
}

const d = { primary: "#2563EB", text: "#111827", secondary: "#4B5563", muted: "#6B7280", border: "#E5E7EB" }

const chipStyle = (c: { text: string; border: string }): React.CSSProperties => ({
  fontSize: 9.5,
  color: c.text,
  border: `1px solid ${c.border}`,
  borderRadius: 2,
  padding: "3px 8px",
  lineHeight: 1.4,
  fontWeight: 500,
  whiteSpace: "nowrap" as const,
})

export function SkillGroup({ skills, variant = "grouped", colors = {}, columns = 2 }: SkillGroupProps) {
  const c = { ...d, ...colors }
  const hasNamed = skills.some(g => g.name)

  if (variant === "list" || variant === "grouped") {
    if (!hasNamed) {
      const all = skills.flatMap(g => g.skills)
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {all.map(s => (
            <span key={s} style={chipStyle(c)}>{s}</span>
          ))}
        </div>
      )
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {skills.map(g => (
          <div key={g.id} style={{ minWidth: 0 }}>
            {g.name ? (
              <>
                <p style={{
                  margin: 0,
                  fontSize: 9,
                  fontWeight: 600,
                  color: c.muted,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                  lineHeight: 1.3,
                }}>
                  {g.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                {g.skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
                    {g.skills.map(s => (
                      <span key={s} style={chipStyle(c)}>{s}</span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {g.skills.map(s => (
                  <span key={s} style={chipStyle(c)}>{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (variant === "tags") {
    const all = skills.flatMap(g => g.skills)
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {all.map(s => (
          <span key={s} style={chipStyle(c)}>{s}</span>
        ))}
      </div>
    )
  }

  if (variant === "pills") {
    const all = skills.flatMap(g => g.skills)
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {all.map(s => (
          <span key={s} style={{ fontSize: 9, color: c.primary, backgroundColor: c.primary + "10", borderRadius: 99, padding: "3px 8px", lineHeight: 1.4, fontWeight: 500 }}>{s}</span>
        ))}
      </div>
    )
  }

  if (variant === "three-column") {
    const all = skills.flatMap(g => g.skills)
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px 10px", fontSize: 9.5, color: c.secondary }}>
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
          <span key={s} style={{ fontSize: 9, padding: "3px 7px", color: c.secondary, borderRight: (i + 1) % 3 !== 0 ? `1px solid ${c.border}` : "none", borderBottom: `1px solid ${c.border}`, lineHeight: 1.5 }}>{s}</span>
        ))}
      </div>
    )
  }

  if (variant === "progress") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "5px 16px" }}>
        {skills.map(g => (
          <div key={g.id} style={{ fontSize: 9.5, minWidth: 0 }}>
            {g.name && <p style={{ margin: "0 0 2px", fontWeight: 600, color: c.text, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{g.name}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {g.skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ flex: 1, color: c.secondary, lineHeight: 1.5 }}>{s}</span>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(dot => (
                      <span key={dot} style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: dot <= 4 ? c.primary : c.border, display: "inline-block" }} />
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

  // categories fallback — same as grouped
  if (!hasNamed) {
    const all = skills.flatMap(g => g.skills)
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {all.map(s => (
          <span key={s} style={chipStyle(c)}>{s}</span>
        ))}
      </div>
    )
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {skills.map(g => (
        <div key={g.id} style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, color: c.muted, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {g.name?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </p>
          {g.skills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
              {g.skills.map(s => (
                <span key={s} style={chipStyle(c)}>{s}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
