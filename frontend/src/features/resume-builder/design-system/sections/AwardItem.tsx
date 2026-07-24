"use client"
import type { AwardItem as AwardItemType } from "@/types/resume"

type AwardItemProps = {
  item: AwardItemType
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string }
}

const d = { primary: "#1e3a5f", text: "#111827", secondary: "#374151", muted: "#6b7280" }

export function AwardItem({ item, colors = {} }: AwardItemProps) {
  const c = { ...d, ...colors }
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>{item.name}</p>
        {item.date && <span style={{ fontSize: 9.5, color: c.muted, whiteSpace: "nowrap", fontWeight: 500 }}>{item.date}</span>}
      </div>
      {item.issuer && <p style={{ margin: "2px 0 0", fontSize: 9.5, color: c.secondary }}>{item.issuer}</p>}
      {item.description && <p style={{ margin: "2px 0 0", fontSize: 9.5, color: c.muted, lineHeight: 1.5 }}>{item.description}</p>}
    </div>
  )
}
