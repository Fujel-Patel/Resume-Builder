"use client"
import type { ContactInfo as ContactInfoType } from "@/types/resume"

type ContactInfoProps = {
  contact: ContactInfoType
  variant?: "inline" | "grid" | "sidebar"
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string }
  showIcons?: boolean
}

const d = { primary: "#1e3a5f", text: "#111827", secondary: "#374151", muted: "#6b7280" }

function ContactItem({ label, value, color }: { label: string; value: string; color: string }) {
  if (!value) return null
  return <span style={{ fontSize: 10, color }}>{value}</span>
}

export function ContactInfo({ contact, variant = "inline", colors = {} }: ContactInfoProps) {
  const c = { ...d, ...colors }
  const items = [
    { label: "Email", value: contact.email },
    { label: "Phone", value: contact.phone },
    { label: "Location", value: contact.location },
    { label: "Website", value: contact.website },
    { label: "LinkedIn", value: contact.linkedin },
    { label: "GitHub", value: contact.github },
  ].filter(i => i.value)

  if (variant === "grid") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 16px", fontSize: 10, color: c.secondary }}>
        {items.map(i => (
          <div key={i.label} style={{ display: "flex", gap: 4, minWidth: 0 }}>
            <span style={{ color: c.muted, flexShrink: 0 }}>{i.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "sidebar") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10 }}>
        {items.map(i => (
          <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{ color: c.primary, fontSize: 8, flexShrink: 0 }}>●</span>
            <span style={{ color: c.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.value}</span>
          </div>
        ))}
      </div>
    )
  }

  // inline (default)
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", fontSize: 10, color: c.secondary }}>
      {items.map(i => (
        <span key={i.label}>{i.value}</span>
      ))}
    </div>
  )
}
