"use client"
import type { LanguageItem as LanguageItemType } from "@/types/resume"

type LanguageItemProps = {
  item: LanguageItemType
  colors?: { primary?: string; text?: string; muted?: string }
}

const d = { primary: "#1e3a5f", text: "#111827", muted: "#6b7280" }

const proficiencyLabels: Record<string, string> = {
  native: "Native",
  fluent: "Fluent",
  advanced: "Advanced",
  intermediate: "Intermediate",
  basic: "Basic",
}

export function LanguageItem({ item, colors = {} }: LanguageItemProps) {
  const c = { ...d, ...colors }
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, fontSize: 10, marginBottom: 4 }}>
      <span style={{ fontWeight: 500, color: c.text }}>{item.name}</span>
      <span style={{ color: c.muted, fontSize: 9.5, fontStyle: "italic" }}>{proficiencyLabels[item.proficiency] ?? item.proficiency}</span>
    </div>
  )
}
