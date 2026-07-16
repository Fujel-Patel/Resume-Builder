"use client"

import type { ResumeData } from "@/types/resume"

const palette = {
  primary: "#5b21b6",
  light: "#f5f3ff",
  muted: "#ede9fe",
  text: "#ffffff",
}

const sans = "Inter, -apple-system, BlinkMacSystemFont, sans-serif"

const styles = {
  page: {
    width: "210mm",
    minHeight: "297mm",
    fontFamily: sans,
    color: "#1e1b4b",
    backgroundColor: "#ffffff",
    boxSizing: "border-box" as const,
    fontSize: "11px",
    lineHeight: "1.5",
    display: "flex",
  },
  leftCol: {
    width: "35%",
    minWidth: "35%",
    backgroundColor: palette.primary,
    color: palette.text,
    padding: "32px 22px",
    boxSizing: "border-box" as const,
  },
  photo: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "#7c3aed",
    border: "3px solid rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: "12px",
  },
  contactSectionTitle: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#c4b5fd",
    marginBottom: "8px",
    paddingBottom: "4px",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  },
  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "5px",
    fontSize: "9.5px",
    color: "#ddd6fe",
    wordBreak: "break-word" as const,
  },
  contactIcon: {
    flexShrink: 0,
    width: "14px",
    textAlign: "center" as const,
    fontSize: "10px",
  },
  skillGroup: {
    marginBottom: "10px",
  },
  skillLabel: {
    fontSize: "9.5px",
    fontWeight: 600,
    color: "#e9d5ff",
    marginBottom: "4px",
  },
  skillBar: {
    width: "100%",
    height: "6px",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: "3px",
    marginBottom: "6px",
    overflow: "hidden" as const,
  },
  skillFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: "3px",
  },
  langItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    marginBottom: "3px",
    color: "#ddd6fe",
  },
  refItem: {
    marginBottom: "8px",
    fontSize: "10px",
  },
  rightCol: {
    flex: 1,
    padding: "32px 24px",
    boxSizing: "border-box" as const,
  },
  nameBlock: {
    marginBottom: "20px",
  },
  fullName: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#1e1b4b",
    marginBottom: "2px",
  },
  jobTitle: {
    fontSize: "13px",
    color: palette.primary,
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#1e1b4b",
    marginBottom: "8px",
    paddingBottom: "4px",
    paddingLeft: "10px",
    borderLeft: `3px solid ${palette.primary}`,
  },
  summaryText: {
    fontSize: "11px",
    lineHeight: "1.6",
    color: "#374151",
    marginBottom: "16px",
  },
  expBlock: {
    marginBottom: "12px",
  },
  expHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
  },
  expRole: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#1e1b4b",
  },
  expCompany: {
    fontSize: "10.5px",
    color: "#6b7280",
  },
  expDate: {
    fontSize: "10px",
    color: "#9ca3af",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  bullet: {
    fontSize: "11px",
    lineHeight: "1.55",
    color: "#374151",
    paddingLeft: "10px",
    position: "relative" as const,
    marginBottom: "2px",
  },
  bulletMarker: {
    position: "absolute" as const,
    left: "0",
    top: "6px",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: palette.primary,
  },
  eduDegree: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#1e1b4b",
  },
  eduInstitution: {
    fontSize: "10.5px",
    color: "#6b7280",
  },
  eduMeta: {
    fontSize: "10px",
    color: "#9ca3af",
  },
  certItem: {
    fontSize: "11px",
    color: "#374151",
    marginBottom: "3px",
  },
  certIssuer: {
    fontSize: "10px",
    color: "#9ca3af",
  },
  awardDesc: {
    fontSize: "10px",
    color: "#6b7280",
    marginTop: "2px",
  },
}

function skillPercent(level: number): number {
  return Math.min(100, Math.max(10, level))
}

export function DesignerCreativeTemplate({ resume }: { resume: ResumeData }) {
  const { content, sections } = resume
  const { contact, summary, experience, education, skills, languages, certifications, projects, awards, interests, references, custom } = content

  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order)

  const sidebarTypes = ["contact", "skills", "languages", "interests", "references"]
  const sidebarSections = visibleSections.filter((s) => sidebarTypes.includes(s.type))
  const mainSections = visibleSections.filter((s) => !sidebarTypes.includes(s.type))

  const initials = contact.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div style={styles.page}>
      {/* Left Column */}
      <aside style={styles.leftCol}>
        {/* Photo */}
        <div style={styles.photo}>
          {contact.photoUrl ? (
            <img
              src={contact.photoUrl}
              alt={contact.fullName}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            initials || "?"
          )}
        </div>

        {/* Contact */}
        {sidebarSections.some((s) => s.type === "contact") && (
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.contactSectionTitle}>Contact</div>
            {contact.email && (
              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>&#9993;</span>
                <span>{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>&#9742;</span>
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.location && (
              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>&#9906;</span>
                <span>{contact.location}</span>
              </div>
            )}
            {contact.website && (
              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>&#128279;</span>
                <span>{contact.website}</span>
              </div>
            )}
            {contact.linkedin && (
              <div style={styles.contactRow}>
                <span style={{ ...styles.contactIcon, fontWeight: 700 }}>in</span>
                <span>{contact.linkedin}</span>
              </div>
            )}
            {contact.github && (
              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>&#128187;</span>
                <span>{contact.github}</span>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && sidebarSections.some((s) => s.type === "skills") && (
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.contactSectionTitle}>Skills</div>
            {skills.map((group) => (
              <div key={group.id} style={styles.skillGroup}>
                <div style={styles.skillLabel}>{group.name}</div>
                {group.skills.map((skill, i) => (
                  <div key={i}>
                    <div style={{ fontSize: "9px", color: "#ddd6fe", marginBottom: "1px" }}>{skill}</div>
                    <div style={styles.skillBar}>
                      <div style={{ ...styles.skillFill, width: `${skillPercent(85 - i * 10)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && sidebarSections.some((s) => s.type === "languages") && (
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.contactSectionTitle}>Languages</div>
            {languages.map((lang) => (
              <div key={lang.id} style={styles.langItem}>
                <span>{lang.name}</span>
                <span style={{ textTransform: "capitalize" }}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && sidebarSections.some((s) => s.type === "interests") && (
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.contactSectionTitle}>Interests</div>
            <div>
              {interests.map((item) => (
                <span
                  key={item.id}
                  style={{
                    display: "inline-block",
                    fontSize: "9px",
                    padding: "2px 7px",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#ddd6fe",
                    borderRadius: "3px",
                    marginRight: "3px",
                    marginBottom: "3px",
                  }}
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {references.length > 0 && sidebarSections.some((s) => s.type === "references") && (
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.contactSectionTitle}>References</div>
            {references.map((ref) => (
              <div key={ref.id} style={styles.refItem}>
                <div style={{ fontWeight: 600, color: "#ffffff" }}>{ref.name}</div>
                <div style={{ color: "#c4b5fd" }}>{ref.role}</div>
                {ref.company && <div style={{ color: "#c4b5fd" }}>{ref.company}</div>}
                {ref.email && <div style={{ color: "#a78bfa" }}>{ref.email}</div>}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Right Column */}
      <main style={styles.rightCol}>
        {/* Name */}
        <div style={styles.nameBlock}>
          <div style={styles.fullName}>{contact.fullName || "Your Name"}</div>
          <div style={styles.jobTitle}>{contact.title || "Job Title"}</div>
        </div>

        {/* Summary */}
        {summary && mainSections.some((s) => s.type === "summary") && (
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>Professional Summary</div>
            <p style={styles.summaryText}>{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && mainSections.some((s) => s.type === "experience") && (
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>Experience</div>
            {experience.map((exp) => (
              <div key={exp.id} style={styles.expBlock}>
                <div style={styles.expHeader}>
                  <div>
                    <div style={styles.expRole}>{exp.role}</div>
                    <div style={styles.expCompany}>
                      {exp.company}{exp.location ? ` \u2014 ${exp.location}` : ""}
                    </div>
                  </div>
                  {(exp.startDate || exp.endDate) && (
                    <div style={styles.expDate}>
                      {exp.startDate}
                      {exp.startDate && (exp.endDate || exp.current) ? " \u2013 " : ""}
                      {exp.current ? "Present" : exp.endDate}
                    </div>
                  )}
                </div>
                {exp.bullets.length > 0 && (
                  <div style={{ marginTop: "4px" }}>
                    {exp.bullets.map((bullet, i) => (
                      <div key={i} style={styles.bullet}>
                        <div style={styles.bulletMarker} />
                        {bullet}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && mainSections.some((s) => s.type === "projects") && (
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>Projects</div>
            {projects.map((proj) => (
              <div key={proj.id} style={styles.expBlock}>
                <div style={styles.expHeader}>
                  <div>
                    <div style={styles.expRole}>
                      {proj.name}{proj.role ? ` \u2014 ${proj.role}` : ""}
                    </div>
                  </div>
                  {(proj.startDate || proj.endDate) && (
                    <div style={styles.expDate}>
                      {proj.startDate}
                      {proj.startDate && proj.endDate ? " \u2013 " : ""}
                      {proj.endDate}
                    </div>
                  )}
                </div>
                {proj.bullets.length > 0 && (
                  <div style={{ marginTop: "4px" }}>
                    {proj.bullets.map((bullet, i) => (
                      <div key={i} style={styles.bullet}>
                        <div style={styles.bulletMarker} />
                        {bullet}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education.length > 0 && mainSections.some((s) => s.type === "education") && (
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>Education</div>
            {education.map((edu) => (
              <div key={edu.id} style={styles.expBlock}>
                <div style={styles.expHeader}>
                  <div>
                    <div style={styles.eduDegree}>
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                    </div>
                    <div style={styles.eduInstitution}>{edu.institution}</div>
                    {edu.gpa && <div style={styles.eduMeta}>GPA: {edu.gpa}</div>}
                  </div>
                  {(edu.startDate || edu.endDate) && (
                    <div style={styles.expDate}>
                      {edu.startDate}
                      {edu.startDate && (edu.endDate || edu.current) ? " \u2013 " : ""}
                      {edu.current ? "Present" : edu.endDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && mainSections.some((s) => s.type === "certifications") && (
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>Certifications</div>
            {certifications.map((cert) => (
              <div key={cert.id} style={styles.expBlock}>
                <div style={styles.expHeader}>
                  <div>
                    <div style={styles.certItem}>{cert.name}</div>
                    {cert.issuer && <div style={styles.certIssuer}>{cert.issuer}</div>}
                  </div>
                  {cert.date && <div style={styles.expDate}>{cert.date}</div>}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Awards */}
        {awards.length > 0 && mainSections.some((s) => s.type === "awards") && (
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>Awards</div>
            {awards.map((award) => (
              <div key={award.id} style={styles.expBlock}>
                <div style={styles.expHeader}>
                  <div>
                    <div style={styles.certItem}>{award.name}</div>
                    {award.issuer && <div style={styles.certIssuer}>{award.issuer}</div>}
                  </div>
                  {award.date && <div style={styles.expDate}>{award.date}</div>}
                </div>
                {award.description && <div style={styles.awardDesc}>{award.description}</div>}
              </div>
            ))}
          </section>
        )}

        {/* Custom Sections */}
        {custom.length > 0 && mainSections.some((s) => s.type === "custom") && (
          <>
            {custom.map((section) => (
              <section key={section.id} style={{ marginBottom: "16px" }}>
                <div style={styles.sectionTitle}>{section.title}</div>
                {section.content && <p style={styles.summaryText}>{section.content}</p>}
                {section.bullets.length > 0 && (
                  <div>
                    {section.bullets.map((bullet, i) => (
                      <div key={i} style={styles.bullet}>
                        <div style={styles.bulletMarker} />
                        {bullet}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  )
}
