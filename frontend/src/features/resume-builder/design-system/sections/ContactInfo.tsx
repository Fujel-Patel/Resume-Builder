"use client"
import type { ContactInfo as ContactInfoType } from "@/types/resume"

type ContactInfoProps = {
  contact: ContactInfoType
  variant?: string
  colors?: { primary?: string; text?: string; secondary?: string; muted?: string }
  showIcons?: boolean
}

const d = { primary: "#2563EB", text: "#111827", secondary: "#4B5563", muted: "#6B7280" }

const iconMap: Record<string, string> = {
  Email: "\u2709",
  Phone: "\u260E",
  Location: "\u2302",
  Website: "\u2731",
  LinkedIn: "\uFB02",
  GitHub: "\u2261",
}

export function ContactInfo({ contact, variant = "inline", colors = {}, showIcons = true }: ContactInfoProps) {
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px", fontSize: 9.5, color: c.secondary }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 9.5 }}>
        {items.map(i => (
          <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: c.primary,
              flexShrink: 0,
            }} />
            <span style={{ color: c.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "chips") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, fontSize: 9 }}>
        {items.map(i => (
          <span key={i.label} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 7px", backgroundColor: c.primary + "08", border: `1px solid ${c.primary}18`, borderRadius: 99, color: c.secondary, lineHeight: 1.5 }}>
            {i.value}
          </span>
        ))}
      </div>
    )
  }

  if (variant === "right-aligned") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 0", justifyContent: "flex-end", fontSize: 9.5, color: c.secondary, alignItems: "center" }}>
        {items.map((item, idx) => (
          <span key={item.label} style={{ display: "inline-flex", alignItems: "center" }}>
            {showIcons && <span style={{ color: c.muted, fontSize: 8, marginRight: 3 }}>{iconMap[item.label] ?? "\u2022"}</span>}
            <span>{item.value}</span>
            {idx < items.length - 1 && <span style={{ color: c.muted, margin: "0 7px", fontSize: 7 }}>\u2022</span>}
          </span>
        ))}
      </div>
    )
  }

  if (variant === "compact-icons") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 9.5, color: c.secondary, alignItems: "center" }}>
        {items.map(item => (
          <span key={item.label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {showIcons && (
              <span style={{ color: c.muted, fontSize: 8, lineHeight: 1, flexShrink: 0 }}>
                {iconMap[item.label] ?? "\u2022"}
              </span>
            )}
            <span>{item.value}</span>
          </span>
        ))}
      </div>
    )
  }

  if (variant === "two-rows") {
    const mid = Math.ceil(items.length / 2)
    const row1 = items.slice(0, mid)
    const row2 = items.slice(mid)
    return (
      <div style={{ fontSize: 9.5, color: c.secondary }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 0", alignItems: "center" }}>
          {row1.map((item, idx) => (
            <span key={item.label} style={{ display: "inline-flex", alignItems: "center" }}>
              {showIcons && <span style={{ color: c.muted, fontSize: 8, marginRight: 3 }}>{iconMap[item.label] ?? "\u2022"}</span>}
              <span>{item.value}</span>
              {idx < row1.length - 1 && <span style={{ color: c.muted, margin: "0 7px", fontSize: 7 }}>\u2022</span>}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 0", alignItems: "center", marginTop: 2 }}>
          {row2.map((item, idx) => (
            <span key={item.label} style={{ display: "inline-flex", alignItems: "center" }}>
              {showIcons && <span style={{ color: c.muted, fontSize: 8, marginRight: 3 }}>{iconMap[item.label] ?? "\u2022"}</span>}
              <span>{item.value}</span>
              {idx < row2.length - 1 && <span style={{ color: c.muted, margin: "0 7px", fontSize: 7 }}>\u2022</span>}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // inline (default)
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 0", fontSize: 9.5, color: c.secondary, alignItems: "center" }}>
      {items.map((item, idx) => (
        <span key={item.label} style={{ display: "inline-flex", alignItems: "center" }}>
          {showIcons && <span style={{ color: c.muted, fontSize: 8, marginRight: 3 }}>{iconMap[item.label] ?? "\u2022"}</span>}
          <span>{item.value}</span>
          {idx < items.length - 1 && <span style={{ color: c.muted, margin: "0 7px", fontSize: 7 }}>\u2022</span>}
        </span>
      ))}
    </div>
  )
}
