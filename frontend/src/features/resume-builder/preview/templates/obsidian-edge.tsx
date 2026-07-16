"use client"

import { memo, type CSSProperties, type ReactNode } from "react"
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  FileText,
  Briefcase,
  GraduationCap,
  Brain,
  Languages as LanguagesIcon,
  Award,
  Rocket,
} from "lucide-react"
import type { ResumeData, SkillGroup } from "@/types/resume"

const C = {
  black: "#000000",
  white: "#ffffff",
  mutedWhite: "#E5E7EB",
  heading: "#111827",
  body: "#374151",
  muted: "#6B7280",
}

/** Matches reference: tight A4, clean sans, print-ready */
const PAGE: CSSProperties = {
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  width: "210mm",
  minHeight: "297mm",
  backgroundColor: C.white,
  color: C.body,
  boxSizing: "border-box",
  WebkitFontSmoothing: "antialiased",
}

type Props = { resume: ResumeData }

function resumePropsEqual(a: Props, b: Props): boolean {
  const ac = a.resume
  const bc = b.resume
  return (
    JSON.stringify(ac.content) === JSON.stringify(bc.content) &&
    JSON.stringify(ac.sections) === JSON.stringify(bc.sections) &&
    JSON.stringify(ac.theme) === JSON.stringify(bc.theme)
  )
}

function flattenSkills(groups: SkillGroup[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const group of groups) {
    for (const skill of group.skills) {
      const key = skill.trim()
      if (!key || seen.has(key.toLowerCase())) continue
      seen.add(key.toLowerCase())
      out.push(key)
    }
  }
  return out
}

function formatDateRange(
  startDate: string,
  endDate: string,
  current: boolean,
): string {
  if (!startDate && !endDate && !current) return ""
  const end = current ? "Present" : endDate
  if (startDate && end) return `${startDate} – ${end}`
  return startDate || end
}

function stripUrl(url: string, prefixes: string[]): string {
  let value = url.trim()
  for (const prefix of prefixes) {
    if (value.toLowerCase().startsWith(prefix.toLowerCase())) {
      value = value.slice(prefix.length)
    }
  }
  return value.replace(/\/$/, "")
}

/** Fixed icon slot — keeps icons + text on the same baseline */
function IconSlot({
  children,
  size = 14,
  color = "currentColor",
}: {
  children: ReactNode
  size?: number
  color?: string
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        color,
        lineHeight: 0,
      }}
    >
      {children}
    </span>
  )
}

type ContactCell = { icon: ReactNode; value: string }

export const ObsidianEdgeTemplate = memo(function ObsidianEdgeTemplate({
  resume,
}: Props) {
  const { content, sections } = resume
  const {
    contact,
    summary,
    experience,
    education,
    skills,
    languages,
    certifications,
    projects,
  } = content
  const visibleTypes = new Set(
    sections.filter((s) => s.visible).map((s) => s.type),
  )

  const skillList = flattenSkills(skills)

  // Reference layout: 2×2 grid — email | phone / location | github
  // Prefer that pairing so columns stay balanced (not fill-order cascade).
  const leftCol: ContactCell[] = []
  const rightCol: ContactCell[] = []

  if (contact.email) {
    leftCol.push({
      icon: <Mail size={13} strokeWidth={1.75} />,
      value: contact.email,
    })
  }
  if (contact.phone) {
    rightCol.push({
      icon: <Phone size={13} strokeWidth={1.75} />,
      value: contact.phone,
    })
  }
  if (contact.location) {
    leftCol.push({
      icon: <MapPin size={13} strokeWidth={1.75} />,
      value: contact.location,
    })
  }
  if (contact.github) {
    rightCol.push({
      icon: <Github size={13} strokeWidth={1.75} />,
      value: stripUrl(contact.github, [
        "https://www.github.com/",
        "https://github.com/",
        "http://github.com/",
        "github.com/",
      ]),
    })
  }
  if (contact.linkedin) {
    rightCol.push({
      icon: <Linkedin size={13} strokeWidth={1.75} />,
      value: stripUrl(contact.linkedin, [
        "https://www.linkedin.com/in/",
        "https://linkedin.com/in/",
        "http://linkedin.com/in/",
        "linkedin.com/in/",
      ]),
    })
  }
  if (contact.website) {
    // Keep website on the shorter column so the grid stays balanced
    const cell: ContactCell = {
      icon: <Globe size={13} strokeWidth={1.75} />,
      value: stripUrl(contact.website, ["https://", "http://"]),
    }
    if (leftCol.length <= rightCol.length) leftCol.push(cell)
    else rightCol.push(cell)
  }

  const contactRows = Math.max(leftCol.length, rightCol.length)

  return (
    <div style={PAGE}>
      {/* ===== BLACK HEADER (reference: full-bleed, tight padding) ===== */}
      <header
        style={{
          backgroundColor: C.black,
          color: C.white,
          padding: "26px 28px 22px",
        }}
      >
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            margin: 0,
            padding: 0,
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
            color: C.white,
          }}
        >
          {contact.fullName || "Your Name"}
        </h1>

        {contact.title ? (
          <p
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: C.mutedWhite,
              margin: "5px 0 0 0",
              padding: 0,
              lineHeight: 1.3,
            }}
          >
            {contact.title}
          </p>
        ) : null}

        {contactRows > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: 32,
              rowGap: 7,
              marginTop: 14,
              fontSize: 12,
              lineHeight: 1.35,
              color: C.white,
            }}
          >
            {Array.from({ length: contactRows }).flatMap((_, row) => [
              <ContactLine key={`l-${row}`} cell={leftCol[row]} />,
              <ContactLine key={`r-${row}`} cell={rightCol[row]} />,
            ])}
          </div>
        ) : null}
      </header>

      {/* ===== WHITE BODY ===== */}
      <div
        style={{
          backgroundColor: C.white,
          padding: "18px 28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {summary && visibleTypes.has("summary") ? (
          <Section
            icon={<FileText size={15} strokeWidth={2} />}
            title="Summary"
          >
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: C.body,
                margin: 0,
                padding: 0,
              }}
            >
              {summary}
            </p>
          </Section>
        ) : null}

        {experience.length > 0 && visibleTypes.has("experience") ? (
          <Section
            icon={<Briefcase size={15} strokeWidth={2} />}
            title="Professional Experience"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {experience.map((exp) => {
                const role = exp.role?.trim() ?? ""
                const company = exp.company?.trim() ?? ""
                const dates = formatDateRange(
                  exp.startDate,
                  exp.endDate,
                  exp.current,
                )
                const meta = [dates, exp.location?.trim()]
                  .filter(Boolean)
                  .join(" | ")

                // Avoid leading ", Company" when role is empty
                let titleNode: ReactNode = null
                if (role && company) {
                  titleNode = (
                    <>
                      <span style={{ fontWeight: 700 }}>{role}</span>
                      <span style={{ fontWeight: 400 }}>{`, ${company}`}</span>
                    </>
                  )
                } else if (role) {
                  titleNode = <span style={{ fontWeight: 700 }}>{role}</span>
                } else if (company) {
                  titleNode = <span style={{ fontWeight: 700 }}>{company}</span>
                }

                const bullets = (exp.bullets ?? []).map((b) => b.trim()).filter(Boolean)

                return (
                  <div key={exp.id} className="avoid-break">
                    {(titleNode || meta) && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 16,
                          marginBottom: bullets.length ? 3 : 0,
                        }}
                      >
                        {titleNode ? (
                          <p
                            style={{
                              fontSize: 12.5,
                              color: C.heading,
                              margin: 0,
                              padding: 0,
                              lineHeight: 1.35,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {titleNode}
                          </p>
                        ) : (
                          <span />
                        )}
                        {meta ? (
                          <p
                            style={{
                              fontSize: 11,
                              color: C.muted,
                              margin: 0,
                              padding: 0,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              lineHeight: 1.35,
                            }}
                          >
                            {meta}
                          </p>
                        ) : null}
                      </div>
                    )}
                    {bullets.length > 0 ? (
                      <ul style={BULLET_LIST}>
                        {bullets.map((b, bi) => (
                          <li key={bi} style={BULLET_ITEM}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </Section>
        ) : null}

        {education.length > 0 && visibleTypes.has("education") ? (
          <Section
            icon={<GraduationCap size={15} strokeWidth={2} />}
            title="Education"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {education.map((edu) => {
                const degree = edu.degree?.trim() ?? ""
                const field = edu.field?.trim() ?? ""
                const institution = edu.institution?.trim() ?? ""

                // "Bachelor of Computer Science, Universitas Indonesia"
                // or "MCA, Sigma University" when field empty
                let left = ""
                if (degree && field) {
                  // Prefer "Degree in Field" only when degree is short (B.S., M.S.)
                  // Long degree names like "Bachelor of Computer Science" already include field
                  const degreeHasField =
                    degree.toLowerCase().includes(field.toLowerCase()) ||
                    degree.split(" ").length >= 3
                  left = degreeHasField
                    ? degree
                    : `${degree} in ${field}`
                } else {
                  left = degree || field
                }
                if (institution) {
                  left = left ? `${left}, ${institution}` : institution
                }

                const dates = formatDateRange(
                  edu.startDate,
                  edu.endDate,
                  edu.current,
                )
                // Education type has no location — dates only on the right

                return (
                  <div
                    key={edu.id}
                    className="avoid-break"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: C.heading,
                        margin: 0,
                        padding: 0,
                        lineHeight: 1.35,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {left}
                      {edu.gpa ? (
                        <span
                          style={{
                            fontWeight: 400,
                            color: C.muted,
                            fontSize: 11.5,
                          }}
                        >
                          {` · GPA ${edu.gpa}`}
                        </span>
                      ) : null}
                    </p>
                    {dates ? (
                      <p
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          margin: 0,
                          padding: 0,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          lineHeight: 1.35,
                        }}
                      >
                        {dates}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </Section>
        ) : null}

        {skillList.length > 0 && visibleTypes.has("skills") ? (
          <Section icon={<Brain size={15} strokeWidth={2} />} title="Skills">
            <BulletGrid items={skillList} columns={3} />
          </Section>
        ) : null}

        {languages.length > 0 && visibleTypes.has("languages") ? (
          <Section
            icon={<LanguagesIcon size={15} strokeWidth={2} />}
            title="Languages"
          >
            <BulletGrid
              items={languages.map((lang) => lang.name).filter(Boolean)}
              columns={2}
            />
          </Section>
        ) : null}

        {certifications.length > 0 && visibleTypes.has("certifications") ? (
          <Section
            icon={<Award size={15} strokeWidth={2} />}
            title="Certificates"
          >
            <BulletGrid
              items={certifications.map((cert) => {
                const name = cert.name?.trim() ?? ""
                const issuer = cert.issuer?.trim() ?? ""
                if (name && issuer) return `${name} (${issuer})`
                return name || issuer
              }).filter(Boolean)}
              columns={3}
            />
          </Section>
        ) : null}

        {projects.length > 0 && visibleTypes.has("projects") ? (
          <Section icon={<Rocket size={15} strokeWidth={2} />} title="Projects">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {projects.map((proj) => {
                const bullets = (proj.bullets ?? [])
                  .map((b) => b.trim())
                  .filter(Boolean)
                return (
                  <div key={proj.id} className="avoid-break">
                    <p
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: C.heading,
                        margin: 0,
                        padding: 0,
                        lineHeight: 1.35,
                      }}
                    >
                      {proj.name}
                      {proj.role ? (
                        <span style={{ fontWeight: 400 }}>
                          {` — ${proj.role}`}
                        </span>
                      ) : null}
                    </p>
                    {bullets.length > 0 ? (
                      <ul style={{ ...BULLET_LIST, marginTop: 3 }}>
                        {bullets.map((b, bi) => (
                          <li key={bi} style={BULLET_ITEM}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </Section>
        ) : null}
      </div>
    </div>
  )
}, resumePropsEqual)

function ContactLine({ cell }: { cell?: ContactCell }) {
  if (!cell) {
    return <span aria-hidden style={{ minHeight: 1 }} />
  }
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
        wordBreak: "break-word",
      }}
    >
      <IconSlot size={14} color={C.white}>
        {cell.icon}
      </IconSlot>
      <span style={{ minWidth: 0 }}>{cell.value}</span>
    </span>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <section className="avoid-break" style={{ margin: 0, padding: 0 }}>
      <h2
        style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: C.heading,
          margin: "0 0 7px 0",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 7,
          letterSpacing: "0.01em",
          lineHeight: 1.2,
        }}
      >
        <IconSlot size={16} color={C.heading}>
          {icon}
        </IconSlot>
        <span>{title}</span>
      </h2>
      {children}
    </section>
  )
}

/** Classic disc bullets matching reference (• not custom circles) */
const BULLET_LIST: CSSProperties = {
  margin: 0,
  padding: "0 0 0 16px",
  listStyleType: "disc",
  listStylePosition: "outside",
  fontSize: 11.5,
  lineHeight: 1.55,
  color: C.body,
}

const BULLET_ITEM: CSSProperties = {
  margin: "0 0 1px 0",
  padding: 0,
}

function BulletGrid({
  items,
  columns,
}: {
  items: string[]
  columns: 2 | 3
}) {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        columnGap: 12,
        rowGap: 3,
        fontSize: 11.5,
        lineHeight: 1.5,
        color: C.body,
      }}
    >
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 7,
            minWidth: 0,
            margin: 0,
            padding: 0,
          }}
        >
          {/* True disc bullet aligned to first text line */}
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              width: 4,
              height: 4,
              marginTop: 6,
              borderRadius: "50%",
              backgroundColor: C.body,
            }}
          />
          <span style={{ wordBreak: "break-word", minWidth: 0 }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}
