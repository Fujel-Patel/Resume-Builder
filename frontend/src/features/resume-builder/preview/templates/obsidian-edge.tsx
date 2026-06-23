"use client"

import { Mail, Phone, MapPin, Globe, Github, Linkedin } from "lucide-react"
import type { ResumeData } from "@/types/resume"

const C = {
  black: "#000000",
  white: "#ffffff",
  mutedWhite: "#E5E7EB",
  bodyBg: "#F4F5F7",
  heading: "#111827",
  body: "#374151",
}

type Props = { resume: ResumeData }

const SECTION_ICONS: Record<string, string> = {
  summary: "\uD83D\uDCC4",
  experience: "\uD83D\uDCBC",
  education: "\uD83C\uDF93",
  skills: "\uD83E\uDDE0",
  languages: "\uD83C\uDF0D",
  certifications: "\uD83C\uDFC6",
  projects: "\uD83D\uDE80",
}

export function ObsidianEdgeTemplate({ resume }: Props) {
  const { content, sections } = resume
  const { contact, summary, experience, education, skills, languages, certifications, projects } = content
  const visibleTypes = new Set(sections.filter(s => s.visible).map(s => s.type))

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        width: "210mm",
        backgroundColor: "#ffffff",
        color: C.body,
      }}
    >
      {/* Black header */}
      <section
        style={{
          backgroundColor: C.black,
          color: C.white,
          padding: 32,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {contact.fullName || "Your Name"}
        </h1>
        <p
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: C.mutedWhite,
            margin: "4px 0 0 0",
          }}
        >
          {contact.title || "Job Title"}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            marginTop: 16,
            fontSize: 13,
            color: C.white,
          }}
        >
          {contact.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5 shrink-0" />
              {contact.email}
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 shrink-0" />
              {contact.phone}
            </span>
          )}
          {contact.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {contact.location}
            </span>
          )}
          {contact.website && (
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5 shrink-0" />
              {contact.website}
            </span>
          )}
          {contact.github && (
            <span className="flex items-center gap-1.5">
              <Github className="size-3.5 shrink-0" />
              {contact.github.replace("https://github.com/", "")}
            </span>
          )}
          {contact.linkedin && (
            <span className="flex items-center gap-1.5">
              <Linkedin className="size-3.5 shrink-0" />
              {contact.linkedin.replace("https://linkedin.com/in/", "")}
            </span>
          )}
        </div>
      </section>

      {/* Light gray body */}
      <div
        style={{
          backgroundColor: C.bodyBg,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {summary && visibleTypes.has("summary") && (
          <Section icon={SECTION_ICONS.summary} title="Summary">
            <p style={{ fontSize: 14, lineHeight: 1.7, color: C.body, margin: 0 }}>
              {summary}
            </p>
          </Section>
        )}

        {experience.length > 0 && visibleTypes.has("experience") && (
          <Section icon={SECTION_ICONS.experience} title="Professional Experience">
            {experience.map((exp, i) => (
              <div
                key={exp.id}
                style={{
                  marginBottom: i < experience.length - 1 ? 12 : 0,
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
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.heading, margin: 0 }}>
                      {exp.role}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.body, margin: "2px 0 0 0" }}>
                      {exp.company}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 13, color: C.body, lineHeight: 1.4 }}>
                    {exp.location && <p style={{ margin: 0 }}>{exp.location}</p>}
                    {(exp.startDate || exp.endDate) && (
                      <p style={{ margin: 0 }}>
                        {exp.startDate}
                        {exp.startDate && exp.endDate && " – "}
                        {exp.current ? "Present" : exp.endDate}
                      </p>
                    )}
                  </div>
                </div>
                {exp.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "6px 0 0 0",
                      paddingLeft: 18,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: C.body,
                    }}
                  >
                    {exp.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {education.length > 0 && visibleTypes.has("education") && (
          <Section icon={SECTION_ICONS.education} title="Education">
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
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.heading, margin: 0 }}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 400, color: C.body, margin: "2px 0 0 0" }}>
                    {edu.institution}
                  </p>
                </div>
                <div style={{ textAlign: "right", fontSize: 13, color: C.body, lineHeight: 1.4 }}>
                  {(edu.startDate || edu.endDate) && (
                    <p style={{ margin: 0 }}>
                      {edu.startDate}
                      {edu.startDate && edu.endDate && " – "}
                      {edu.current ? "Present" : edu.endDate}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </Section>
        )}

        {skills.length > 0 && visibleTypes.has("skills") && (
          <Section icon={SECTION_ICONS.skills} title="Skills">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {skills.map((group) => (
                <div key={group.id}>
                  {group.name && (
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.heading, margin: "0 0 4px 0" }}>
                      {group.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                  )}
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: 13,
                      color: C.body,
                      lineHeight: 1.6,
                    }}
                  >
                    {group.skills.map((s, si) => (
                      <li key={si}>{s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        {languages.length > 0 && visibleTypes.has("languages") && (
          <Section icon={SECTION_ICONS.languages} title="Languages">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {languages.map((lang) => (
                <div key={lang.id} style={{ fontSize: 13, color: C.body }}>
                  <p style={{ fontWeight: 600, margin: "0 0 2px 0", color: C.heading }}>
                    {lang.name}
                  </p>
                  <p style={{ margin: 0, textTransform: "capitalize" }}>
                    {lang.proficiency}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {certifications.length > 0 && visibleTypes.has("certifications") && (
          <Section icon={SECTION_ICONS.certifications} title="Certificates">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: 13,
                      color: C.body,
                      lineHeight: 1.6,
                    }}
                  >
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

        {projects.length > 0 && visibleTypes.has("projects") && (
          <Section icon={SECTION_ICONS.projects} title="Projects">
            {projects.map((proj, i) => (
              <div
                key={proj.id}
                style={{ marginBottom: i < projects.length - 1 ? 12 : 0 }}
              >
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: C.heading,
                    margin: "0 0 2px 0",
                  }}
                >
                  {proj.name}
                  {proj.role ? ` — ${proj.role}` : ""}
                </p>
                {proj.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0 0",
                      paddingLeft: 18,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: C.body,
                    }}
                  >
                    {proj.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon?: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: C.heading,
          margin: "0 0 12px 0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  )
}
