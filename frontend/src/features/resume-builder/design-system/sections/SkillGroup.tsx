"use client"
import type { SkillGroup as SkillGroupType } from "@/types/resume"

type SkillGroupProps = {
  skills: SkillGroupType[]
  variant?: "list" | "grouped" | "tags" | "pills" | "categories"
  colors?: { primary?: string; text?: string; muted?: string; border?: string }
  columns?: 1 | 2
}

const d = { primary: "#1e3a5f", text: "#111827", muted: "#6b7280", border: "#e5e7eb" }

export function SkillGroup({ skills, variant = "grouped", colors = {}, columns = 2 }: SkillGroupProps) {
  const c = { ...d, ...colors }
  const hasNamed = skills.some(g => g.name)

  if (variant === "list" || variant === "grouped") {
    if (!hasNamed) {
      const all = skills.flatMap(g => g.skills)
      return <p style={{ margin: 0, fontSize: 10, color: c.muted, lineHeight: 1.5 }}>{all.join(", ")}</p>
    }
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "4px 16px" }}>
        {skills.map(g => (
          <div key={g.id} style={{ fontSize: 10, color: c.muted, lineHeight: 1.5, minWidth: 0 }}>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {all.map(s => (
          <span key={s} style={{ fontSize: 9, color: c.text, border: `1px solid ${c.border}`, borderRadius: 3, padding: "1px 6px", lineHeight: 1.5 }}>{s}</span>
        ))}
      </div>
    )
  }

  if (variant === "pills") {
    const all = skills.flatMap(g => g.skills)
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {all.map(s => (
          <span key={s} style={{ fontSize: 9, color: c.text, backgroundColor: c.primary + "12", borderRadius: 99, padding: "2px 8px", lineHeight: 1.5 }}>{s}</span>
        ))}
      </div>
    )
  }

  // categories
  if (!hasNamed) {
    const all = skills.flatMap(g => g.skills)
    return <p style={{ margin: 0, fontSize: 10, color: c.muted, lineHeight: 1.5 }}>{all.join(", ")}</p>
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "4px 16px" }}>
      {skills.map(g => (
        <div key={g.id} style={{ fontSize: 10, lineHeight: 1.5, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, color: c.primary, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {g.name?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </p>
          <p style={{ margin: "2px 0 0", color: c.muted }}>{g.skills.join(", ")}</p>
        </div>
      ))}
    </div>
  )
}
