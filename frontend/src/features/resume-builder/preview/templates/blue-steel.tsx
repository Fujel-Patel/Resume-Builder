"use client"

import { MapPin, Mail, Phone, Linkedin } from "lucide-react"
import type { ResumeData } from "@/types/resume"
import { ProfileImage, CompactSkills } from "../resume-page"

const C = {
  primary: "#2F3552",
  headerBg: "#DCE4EA",
  bodyBg: "#F3F4F6",
  cardBg: "#ffffff",
  text: "#3A3A3A",
  muted: "#6B7280",
  heading: "#2F3552",
}

type Props = { resume: ResumeData }

export function BlueSteelTemplate({ resume }: Props) {
  const { content, sections } = resume
  const { contact, summary, experience, education, skills, languages, interests, projects } = content
  const visibleTypes = new Set(sections.filter(s => s.visible).map(s => s.type))

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        width: "210mm",
        backgroundColor: C.bodyBg,
        color: C.text,
      }}
    >
      {/* Header banner */}
      <div
        style={{
          backgroundColor: C.headerBg,
          padding: "28px 32px",
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h1
              style={{
                fontFamily: "Playfair Display, 'Times New Roman', serif",
                fontSize: 32,
                fontWeight: 700,
                color: C.heading,
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {contact.fullName || "Your Name"}
            </h1>
            {contact.title && (
              <span
                style={{
                  fontFamily: "Playfair Display, 'Times New Roman', serif",
                  fontSize: 20,
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: C.muted,
                  lineHeight: 1.2,
                }}
              >
                {contact.title}
              </span>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px 24px",
              marginTop: 14,
              fontSize: 12,
              color: C.text,
            }}
          >
            {contact.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3 shrink-0" style={{ color: C.primary }} />
                <span>{contact.location}</span>
              </span>
            )}
            {contact.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="size-3 shrink-0" style={{ color: C.primary }} />
                <span>{contact.email}</span>
              </span>
            )}
            {contact.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="size-3 shrink-0" style={{ color: C.primary }} />
                <span>{contact.phone}</span>
              </span>
            )}
            {contact.linkedin && (
              <span className="flex items-center gap-1.5">
                <Linkedin className="size-3 shrink-0" style={{ color: C.primary }} />
                <span>{contact.linkedin.replace("https://linkedin.com/in/", "")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Photo circle */}
        <ProfileImage
          photoUrl={contact.photoUrl}
          fullName={contact.fullName}
          size={80}
          borderRadius="50%"
          bgColor={C.primary}
          textColor="#ffffff"
          fontSize={28}
          fontWeight={600}
        />
      </div>

      {/* White card wrapper */}
      <div style={{ padding: "20px 32px 32px" }}>
        {/* Summary */}
        {summary && visibleTypes.has("summary") && (
          <div
            style={{
              backgroundColor: C.cardBg,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: C.text,
                margin: 0,
              }}
            >
              {summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && visibleTypes.has("skills") && (
          <div
            style={{
              backgroundColor: C.cardBg,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <SectionHeading title="Skills" />
            <CompactSkills
              skills={skills}
              fontSize={12}
              color={C.text}
              labelColor={C.heading}
            />
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && visibleTypes.has("projects") && (
          <div
            style={{
              backgroundColor: C.cardBg,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <SectionHeading title="Projects" />
            {projects.map((proj, i) => (
              <div
                key={proj.id}
                style={{
                  marginBottom: i < projects.length - 1 ? 16 : 0,
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: C.heading, margin: 0 }}>
                  {proj.name}
                </p>
                {proj.role && (
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: C.text, margin: "4px 0 0 0" }}>
                    {proj.role}
                  </p>
                )}
                {proj.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0 0",
                      paddingLeft: 14,
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: C.text,
                    }}
                  >
                    {proj.bullets.map((b, bi) => (
                      <li key={bi} style={{ marginBottom: 2 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {experience.length > 0 && visibleTypes.has("experience") && (
          <div
            style={{
              backgroundColor: C.cardBg,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <SectionHeading title="Work Experience" />
            {experience.map((exp, i) => (
              <div
                key={exp.id}
                style={{
                  marginBottom: i < experience.length - 1 ? 16 : 0,
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
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.heading, margin: 0 }}>
                      {exp.role}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: "2px 0 0 0" }}>
                      {exp.company}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
                    {exp.location && <p style={{ margin: 0 }}>{exp.location}</p>}
                    {(exp.startDate || exp.endDate) && (
                      <p style={{ margin: 0 }}>
                        {exp.startDate}
                        {exp.startDate && " – "}
                        {exp.current ? "Present" : exp.endDate}
                      </p>
                    )}
                  </div>
                </div>
                {exp.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "6px 0 0 0",
                      paddingLeft: 14,
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: C.text,
                    }}
                  >
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ marginBottom: 2 }}>
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
        {education.length > 0 && visibleTypes.has("education") && (
          <div
            style={{
              backgroundColor: C.cardBg,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <SectionHeading title="Education" />
            {education.map((edu, i) => (
              <div
                key={edu.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: i < education.length - 1 ? 12 : 0,
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.heading, margin: 0 }}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                  </p>
                  <p style={{ fontSize: 13, color: C.text, margin: "2px 0 0 0" }}>
                    {edu.institution}
                  </p>
                </div>
                {(edu.startDate || edu.endDate) && (
                  <p style={{ fontSize: 12, color: C.muted, margin: 0, whiteSpace: "nowrap" }}>
                    {edu.startDate}
                    {edu.startDate && " – "}
                    {edu.current ? "Present" : edu.endDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom: Languages + Interests */}
        <div style={{ display: "flex", gap: 16 }}>
          {languages.length > 0 && visibleTypes.has("languages") && (
            <div
              style={{
                flex: 1,
                backgroundColor: C.cardBg,
                padding: 20,
              }}
            >
              <SectionHeading title="Languages" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {languages.map((lang) => (
                  <div key={lang.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.heading, minWidth: 70 }}>
                      {lang.name}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((dot) => {
                        const filled = dot <= proficiencyToDots(lang.proficiency)
                        return (
                          <span
                            key={dot}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: filled ? C.primary : "#D1D5DB",
                              display: "inline-block",
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {interests.length > 0 && visibleTypes.has("interests") && (
            <div
              style={{
                flex: 1,
                backgroundColor: C.cardBg,
                padding: 20,
              }}
            >
              <SectionHeading title="Strengths" />
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 14,
                  fontSize: 12,
                  color: C.text,
                  lineHeight: 1.8,
                }}
              >
                {interests.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: C.heading,
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          height: 1,
          backgroundColor: C.primary,
          opacity: 0.3,
          marginTop: 6,
        }}
      />
    </div>
  )
}

function proficiencyToDots(proficiency: string): number {
  const map: Record<string, number> = {
    native: 5,
    fluent: 4,
    advanced: 4,
    intermediate: 3,
    basic: 2,
  }
  return map[proficiency] || 3
}
