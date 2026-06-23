"use client"

import { MapPin, Phone, Mail, Globe } from "lucide-react"
import type { ResumeData } from "@/types/resume"

const C = {
  accent: "#3DDC97",
  text: "#111827",
  secondary: "#4B5563",
  muted: "#6B7280",
  background: "#FFFFFF",
  border: "#E5E7EB",
}

type Props = { resume: ResumeData }

export function NeonGreenTemplate({ resume }: Props) {
  const { content } = resume
  const { contact, summary, experience, education, skills, languages, certifications, projects } = content

  const initials = (contact.fullName || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const allSkills = skills.flatMap((g) => g.skills)

  const contactItems: { icon: React.ReactNode; value: string | undefined }[] = [
    { icon: <MapPin className="size-3 shrink-0" style={{ color: C.accent }} />, value: contact.location },
    { icon: <Phone className="size-3 shrink-0" style={{ color: C.accent }} />, value: contact.phone },
    { icon: <Mail className="size-3 shrink-0" style={{ color: C.accent }} />, value: contact.email },
    { icon: <Globe className="size-3 shrink-0" style={{ color: C.accent }} />, value: contact.github || contact.website },
  ]

  const leftCol = [contactItems[0], contactItems[1]]
  const rightCol = [contactItems[2], contactItems[3]]

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        width: "210mm",
        backgroundColor: C.background,
        color: C.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "36px 40px 28px",
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: C.text,
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {contact.fullName || "Your Name"}
          </h1>
          {contact.title && (
            <p
              style={{
                fontSize: 18,
                fontWeight: 400,
                color: C.secondary,
                margin: "4px 0 0 0",
                lineHeight: 1.3,
              }}
            >
              {contact.title}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 32px",
              marginTop: 16,
              fontSize: 12,
              color: C.secondary,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {leftCol.map(
                (item, i) =>
                  item.value && (
                    <span key={i} className="flex items-center gap-1.5">
                      {item.icon}
                      <span>{item.value}</span>
                    </span>
                  )
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rightCol.map(
                (item, i) =>
                  item.value && (
                    <span key={i} className="flex items-center gap-1.5">
                      {item.icon}
                      <span>{item.value}</span>
                    </span>
                  )
              )}
            </div>
          </div>
        </div>

        {/* Square photo initials */}
        {initials && (
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 6,
              backgroundColor: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: C.background,
              fontSize: 28,
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              lineHeight: 1,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "0 40px 36px" }}>
        {/* Summary */}
        {summary && (
          <div style={{ marginBottom: 28 }}>
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.7,
                color: C.secondary,
                margin: 0,
              }}
            >
              {summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeading title="Professional Experience" />
            {experience.map((exp, i) => (
              <div
                key={exp.id}
                className="avoid-break"
                style={{
                  marginBottom: i < experience.length - 1 ? 18 : 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.text,
                        margin: 0,
                      }}
                    >
                      {exp.role}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        fontStyle: "italic",
                        color: C.secondary,
                        margin: "1px 0 0 0",
                      }}
                    >
                      {exp.company}
                    </p>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color: C.muted,
                      lineHeight: 1.5,
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                    }}
                  >
                    {exp.location && <div>{exp.location}</div>}
                    {(exp.startDate || exp.endDate) && (
                      <div>
                        {exp.startDate}
                        {exp.startDate && " – "}
                        {exp.current ? "Present" : exp.endDate}
                      </div>
                    )}
                  </div>
                </div>
                {exp.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0 0",
                      paddingLeft: 14,
                      fontSize: 11,
                      lineHeight: 1.6,
                      color: C.secondary,
                    }}
                  >
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ marginBottom: 1 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeading title="Education" />
            {education.map((edu, i) => (
              <div
                key={edu.id}
                className="avoid-break"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: i < education.length - 1 ? 12 : 0,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.text,
                      margin: 0,
                    }}
                  >
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      fontStyle: "italic",
                      color: C.secondary,
                      margin: "1px 0 0 0",
                    }}
                  >
                    {edu.institution}
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontSize: 11,
                    color: C.muted,
                    whiteSpace: "nowrap",
                    marginLeft: 12,
                  }}
                >
                  {(edu.startDate || edu.endDate) && (
                    <div>
                      {edu.startDate}
                      {edu.startDate && " – "}
                      {edu.current ? "Present" : edu.endDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {allSkills.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeading title="Skills" />
            <p
              style={{
                fontSize: 11,
                color: C.secondary,
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              {allSkills.join(" \u2022 ")}
            </p>
          </div>
        )}

        {/* Two-column bottom: Languages + Certifications/Projects */}
        {(languages.length > 0 || certifications.length > 0 || projects.length > 0) && (
          <div style={{ display: "flex", gap: 40 }}>
            {/* Left: Languages */}
            {languages.length > 0 && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <SectionHeading title="Languages" />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {languages.map((lang) => (
                    <p
                      key={lang.id}
                      style={{
                        fontSize: 11,
                        color: C.secondary,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {lang.name}{" "}
                      <span style={{ color: C.muted }}>
                        ({lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)})
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Right: Certifications + Projects */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {certifications.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <SectionHeading title="Certifications" />
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 14,
                      fontSize: 11,
                      color: C.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {certifications.map((cert) => {
                      const parts = [cert.name]
                      if (cert.issuer) parts.push(cert.issuer)
                      if (cert.date) parts.push(`(${cert.date})`)
                      return <li key={cert.id}>{parts.join(" — ")}</li>
                    })}
                  </ul>
                </div>
              )}

              {projects.length > 0 && (
                <div>
                  <SectionHeading title="Projects" />
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 14,
                      fontSize: 11,
                      color: C.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {projects.map((proj) => (
                      <li key={proj.id}>
                        <span style={{ fontWeight: 600, color: C.text }}>{proj.name}</span>
                        {proj.bullets.length > 0 && <span>: {proj.bullets[0]}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: C.text,
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          height: 2,
          backgroundColor: C.accent,
          marginTop: 5,
          width: 32,
        }}
      />
    </div>
  )
}
