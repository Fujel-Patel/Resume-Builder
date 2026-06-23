"use client"

import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react"
import type { ResumeData } from "../../types"
import { PROFESSIONAL_EXECUTIVE_COLORS as C } from "./config"

type Props = { data: ResumeData }

export function ProfessionalExecutiveTemplate({ data }: Props) {
  const { personal, links, summary, skills, skillGroups, experience, education, certifications, projects, customSections } = data

  return (
    <div
      className="w-full bg-white text-black"
      style={{
        fontFamily: "Inter, sans-serif",
        maxWidth: 794,
        padding: 40,
        color: C.body,
      }}
    >
      {/* HEADER */}
      <div>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: C.primary,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {personal.name || "Your Name"}
        </h1>
        <p
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: C.roleLabel,
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          {personal.title || "Job Title"}
        </p>

        {/* Contact Row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            marginTop: 20,
            fontSize: 13,
            color: C.dark,
          }}
        >
          {personal.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5 shrink-0" style={{ color: C.primary }} />
              {personal.email}
            </span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 shrink-0" style={{ color: C.primary }} />
              {personal.phone}
            </span>
          )}
          {personal.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" style={{ color: C.primary }} />
              {personal.location}
            </span>
          )}
          {links.linkedin && (
            <span className="flex items-center gap-1.5">
              <Linkedin className="size-3.5 shrink-0" style={{ color: C.primary }} />
              linkedin.com/in/{links.linkedin}
            </span>
          )}
          {links.github && (
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5 shrink-0" style={{ color: C.primary }} />
              github.com/{links.github}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <Divider />

      {/* SUMMARY */}
      {summary && (
        <Section heading="Summary" first>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: C.body,
              margin: 0,
            }}
          >
            {summary}
          </p>
        </Section>
      )}

      {/* EXPERIENCE */}
      {experience.length > 0 && (
        <Section heading="Experience">
          {experience.map((exp, i) => (
            <div
              key={i}
              style={{ marginBottom: i < experience.length - 1 ? 24 : 0 }}
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
                      fontSize: 16,
                      fontWeight: 700,
                      color: C.dark,
                      margin: 0,
                    }}
                  >
                    {exp.role}
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: C.body,
                      margin: "2px 0 0 0",
                    }}
                  >
                    {exp.company}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                  {(exp.startDate || exp.endDate) && (
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.date,
                        margin: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {exp.startDate}
                      {exp.startDate && exp.endDate && " – "}
                      {!exp.endDate || exp.endDate.toLowerCase() === "present" ? "Present" : exp.endDate}
                    </p>
                  )}
                  {exp.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: C.muted,
                        margin: "2px 0 0 0",
                      }}
                    >
                      {exp.company}
                    </p>
                  )}
                </div>
              </div>
              {exp.description && (
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: C.body,
                    marginTop: 6,
                    marginBottom: 0,
                  }}
                >
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <Section heading="Education">
          {education.map((edu, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: i < education.length - 1 ? 16 : 0,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: C.dark,
                    margin: 0,
                  }}
                >
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: C.body,
                    margin: "2px 0 0 0",
                  }}
                >
                  {edu.school}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                {(edu.startDate || edu.endDate) && (
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.date,
                      margin: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {edu.startDate}
                    {edu.startDate && edu.endDate && " – "}
                    {edu.endDate || "Present"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* SKILLS */}
      {(skills.length > 0 || (skillGroups && Object.keys(skillGroups).length > 0)) && (
        <Section heading="Skills">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 40,
            }}
          >
            {skillGroups && Object.keys(skillGroups).length > 0 ? (
              Object.entries(skillGroups).map(([group, groupSkills]) => (
                <div key={group}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.dark,
                      margin: "0 0 4px 0",
                    }}
                  >
                    {group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.body, lineHeight: 1.6 }}>
                    {groupSkills.map((s, si) => (
                      <li key={si}>{s}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.body, lineHeight: 1.6 }}>
                  {skills.map((s, si) => (
                    <li key={si}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* LANGUAGES — from customSections or inline */}
      {customSections?.some((s) => s.label.toLowerCase() === "languages") ? (
        customSections
          .filter((s) => s.label.toLowerCase() === "languages")
          .map((s) => (
            <Section key={s.label} heading={s.label}>
              <p style={{ fontSize: 14, color: C.body, lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                {s.content}
              </p>
            </Section>
          ))
      ) : (
        <Section heading="Languages">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {/* Render default language entries if they exist in the data */}
            <div style={{ fontSize: 14, color: C.body }}>
              <p style={{ fontWeight: 600, margin: "0 0 2px 0", color: C.dark }}>English</p>
              <p style={{ margin: 0, color: C.muted }}>Native</p>
            </div>
          </div>
        </Section>
      )}

      {/* CERTIFICATIONS */}
      {certifications.length > 0 && (
        <Section heading="Certificates">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {certifications.map((cert, i) => (
              <div key={i}>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.body, lineHeight: 1.6 }}>
                  <li>
                    {cert.name}
                    {cert.issuer ? ` — ${cert.issuer}` : ""}
                    {cert.date ? ` (${cert.date})` : ""}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <Section heading="Projects">
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: i < projects.length - 1 ? 16 : 0 }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.dark,
                  margin: "0 0 2px 0",
                }}
              >
                {proj.name}
              </p>
              {proj.description && (
                <p style={{ fontSize: 14, lineHeight: 1.6, color: C.body, margin: 0 }}>
                  {proj.description}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* CUSTOM SECTIONS (non-languages) */}
      {customSections && customSections.length > 0 && (
        <>
          {customSections
            .filter((s) => s.label.toLowerCase() !== "languages")
            .map((s) => (
              <Section key={s.label} heading={s.label}>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: C.body,
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {s.content}
                </p>
              </Section>
            ))}
        </>
      )}
    </div>
  )
}

function Section({ heading, children, first }: { heading: string; children: React.ReactNode; first?: boolean }) {
  return (
    <div style={{ marginTop: first ? 0 : undefined }}>
      <Divider />
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.title,
          margin: "0 0 12px 0",
          textTransform: "none",
        }}
      >
        {heading}
      </h2>
      {children}
    </div>
  )
}

function Divider() {
  return (
    <hr
      style={{
        border: "none",
        height: 2,
        backgroundColor: C.divider,
        marginTop: 12,
        marginBottom: 20,
      }}
    />
  )
}
