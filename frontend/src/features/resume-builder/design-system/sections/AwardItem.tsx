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
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: c.text }}>{item.name}</p>
        {item.date && <span style={{ fontSize: 9, color: c.muted, whiteSpace: "nowrap" }}>{item.date}</span>}
      </div>
      {item.issuer && <p style={{ margin: "1px 0 0", fontSize: 9, color: c.secondary }}>{item.issuer}</p>}
      {item.description && <p style={{ margin: "2px 0 0", fontSize: 9, color: c.muted }}>{item.description}</p>}
    </div>
  )
}
