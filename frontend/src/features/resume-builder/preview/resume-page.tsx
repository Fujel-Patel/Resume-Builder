"use client"

import { forwardRef, type ReactNode } from "react"
import type { SkillGroup } from "@/types/resume"

type ResumePageProps = {
  children: ReactNode
  className?: string
}

export const ResumePage = forwardRef<HTMLDivElement, ResumePageProps>(
  ({ children, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`resume-page bg-white text-[#333333] ${className}`}
        style={{
          width: "210mm",
          padding: "0.75in",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          lineHeight: 1.4,
        }}
      >
        {children}
      </div>
    )
  }
)
ResumePage.displayName = "ResumePage"

type ResumeSectionTitleProps = {
  children: ReactNode
  icon?: ReactNode
  style?: "underline" | "border" | "filled" | "minimal"
  className?: string
}

export function ResumeSectionTitle({
  children,
  icon,
  style = "underline",
  className = "",
}: ResumeSectionTitleProps) {
  return (
    <div className={`mb-1.5 ${className}`}>
      {style === "underline" && (
        <div className="flex items-center gap-2 pb-1 border-b border-gray-300">
          {icon && <span className="text-blue-900 shrink-0">{icon}</span>}
          <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-gray-800">
            {children}
          </h2>
        </div>
      )}
      {style === "border" && (
        <div className="flex items-center gap-2 mb-1.5">
          {icon && <span className="text-blue-900 shrink-0">{icon}</span>}
          <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-gray-800 px-3 py-1 border-2 border-gray-800 inline-block">
            {children}
          </h2>
        </div>
      )}
      {style === "filled" && (
        <div className="flex items-center gap-2 mb-1.5">
          {icon && <span className="text-white shrink-0">{icon}</span>}
          <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-white px-3 py-1 bg-gray-800 inline-block">
            {children}
          </h2>
        </div>
      )}
      {style === "minimal" && (
        <div className="flex items-center gap-2 mb-1.5">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          <h2 className="text-[9px] font-bold uppercase tracking-[2px] text-gray-400">
            {children}
          </h2>
        </div>
      )}
    </div>
  )
}

function getInitials(fullName: string): string {
  return (fullName || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

type ProfileImageProps = {
  photoUrl?: string
  fullName: string
  size?: number
  borderRadius?: number | string
  bgColor?: string
  textColor?: string
  fontSize?: number
  fontWeight?: number
  className?: string
}

export function ProfileImage({
  photoUrl,
  fullName,
  size = 80,
  borderRadius = "50%",
  bgColor = "#6B7280",
  textColor = "#ffffff",
  fontSize = 28,
  fontWeight = 600,
  className = "",
}: ProfileImageProps) {
  const initials = getInitials(fullName)

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={fullName || "Profile"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <span
          style={{
            color: textColor,
            fontSize,
            fontWeight,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1,
          }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}

type CompactSkillsProps = {
  skills: SkillGroup[]
  fontSize?: number
  color?: string
  labelColor?: string
  columns?: 1 | 2
}

export function CompactSkills({
  skills,
  fontSize = 11,
  color = "#374151",
  labelColor,
  columns = 2,
}: CompactSkillsProps) {
  const hasNamedGroups = skills.some((g) => g.name)

  if (!hasNamedGroups) {
    const allSkills = skills.flatMap((g) => g.skills)
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {allSkills.map((s) => (
          <span
            key={s}
            style={{
              fontSize: fontSize - 1,
              color,
              backgroundColor: color === "#333333" || color === "#374151" || color === "#222222"
                ? "#F3F4F6"
                : color === "#ffffff" ? "rgba(255,255,255,0.15)" : "#F3F4F6",
              padding: "2px 8px",
              borderRadius: 3,
              lineHeight: 1.5,
            }}
          >
            {s}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "6px 24px",
      }}
    >
      {skills.map((group) => (
        <div key={group.id} style={{ fontSize, color, lineHeight: 1.5, minWidth: 0 }}>
          {group.name ? (
            <p style={{ margin: 0 }}>
              <span style={{ fontWeight: 600, color: labelColor || color }}>
                {group.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              {group.skills.length > 0 && (
                <span style={{ color }}>{"\u00a0\u2014\u00a0"}{group.skills.join(", ")}</span>
              )}
            </p>
          ) : (
            <p style={{ margin: 0 }}>{group.skills.join(", ")}</p>
          )}
        </div>
      ))}
    </div>
  )
}
