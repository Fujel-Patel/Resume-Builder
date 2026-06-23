"use client"

import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react"
import type { ResumeData } from "@/types/resume"

const C = {
  primary: "#355E88",
  divider: "#4A6785",
  dark: "#222222",
  body: "#333333",
  muted: "#666666",
  title: "#355E88",
  roleLabel: "#4E6B86",
  date: "#444444",
}

type Props = { resume: ResumeData }

export function ProfessionalExecutiveTemplate({ resume }: Props) {
  const { content, sections } = resume
  const { contact, summary, experience, education, skills, languages, certifications, projects } = content
  const visibleTypes = new Set(sections.filter(s => s.visible).map(s => s.type))

  return (
    <div
      className="w-full bg-white"
      style={{
        fontFamily: "Inter, sans-serif",
        width: "210mm",
        padding: 40,
        color: C.body,
      }}
    >
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
          {contact.fullName || "Your Name"}
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
          {contact.title || "Job Title"}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 14,
            fontSize: 13,
            color: C.dark,
          }}
        >
          {contact.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5 shrink-0" style={{ color: C.primary }} />
              {contact.email}
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 shrink-0" style={{ color: C.primary }} />
              {contact.phone}
            </span>
          )}
          {contact.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" style={{ color: C.primary }} />
              {contact.location}
            </span>
          )}
          {contact.linkedin && (
            <span className="flex items-center gap-1.5">
              <Linkedin className="size-3.5 shrink-0" style={{ color: C.primary }} />
              {contact.linkedin.replace("https://linkedin.com/in/", "")}
            </span>
          )}
          {contact.github && (
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5 shrink-0" style={{ color: C.primary }} />
              {contact.github.replace("https://github.com/", "")}
            </span>
          )}
        </div>
      </div>

      <Divider />

      {summary && visibleTypes.has("summary") && (
        <Section heading="Summary">
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

      {experience.length > 0 && visibleTypes.has("experience") && (
        <Section heading="Experience">
          {experience.map((exp, i) => (
            <div
              key={exp.id}
              style={{ marginBottom: i < experience.length - 1 ? 16 : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: C.dark, margin: 0 }}>
                    {exp.role}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: C.body, margin: "2px 0 0 0" }}>
                    {exp.company}
                  </p>
                </div>
                {(exp.startDate || exp.endDate) && (
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.date, margin: 0, whiteSpace: "nowrap" }}>
                    {exp.startDate}
                    {exp.startDate && exp.endDate && " – "}
                    {exp.current ? "Present" : exp.endDate}
                  </p>
                )}
              </div>
              {exp.bullets.length > 0 && (
                <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: C.body }}>
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && visibleTypes.has("education") && (
        <Section heading="Education">
          {education.map((edu, i) => (
            <div
              key={edu.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: i < education.length - 1 ? 16 : 0,
              }}
            >
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.dark, margin: 0 }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                </p>
                <p style={{ fontSize: 15, fontWeight: 500, color: C.body, margin: "2px 0 0 0" }}>
                  {edu.institution}
                </p>
              </div>
              {(edu.startDate || edu.endDate) && (
                <p style={{ fontSize: 14, fontWeight: 600, color: C.date, margin: 0, whiteSpace: "nowrap" }}>
                  {edu.startDate}
                  {edu.startDate && edu.endDate && " – "}
                  {edu.current ? "Present" : edu.endDate}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && visibleTypes.has("skills") && (
        <Section heading="Skills">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {skills.map((group) => (
              <div key={group.id}>
                {group.name && (
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 4px 0" }}>
                    {group.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                )}
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.body, lineHeight: 1.6 }}>
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
        <Section heading="Languages">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {languages.map((lang) => (
              <div key={lang.id} style={{ fontSize: 14, color: C.body }}>
                <p style={{ fontWeight: 600, margin: "0 0 2px 0", color: C.dark }}>{lang.name}</p>
                <p style={{ margin: 0, color: C.muted, textTransform: "capitalize" }}>{lang.proficiency}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {certifications.length > 0 && visibleTypes.has("certifications") && (
        <Section heading="Certificates">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {certifications.map((cert) => (
              <div key={cert.id}>
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

      {projects.length > 0 && visibleTypes.has("projects") && (
        <Section heading="Projects">
          {projects.map((proj, i) => (
            <div key={proj.id} style={{ marginBottom: i < projects.length - 1 ? 16 : 0 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.dark, margin: "0 0 2px 0" }}>
                {proj.name}
                {proj.role ? ` — ${proj.role}` : ""}
              </p>
              {proj.bullets.length > 0 && (
                <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: C.body }}>
                  {proj.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <Divider />
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.title,
          margin: "0 0 8px 0",
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
        marginTop: 8,
        marginBottom: 12,
      }}
    />
  )
}
