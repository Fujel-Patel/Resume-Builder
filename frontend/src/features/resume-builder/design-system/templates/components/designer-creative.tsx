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
    width: "794px",
    minHeight: "1123px",
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
    padding: "34px 22px",
    boxSizing: "border-box" as const,
  },
  photo: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    backgroundColor: "#7c3aed",
    border: "3px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "38px",
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: "16px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
  contactSectionTitle: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#c4b5fd",
    marginBottom: "10px",
    paddingBottom: "0",
    borderBottom: "none",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
  },
  sidebarDivider: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
    fontSize: "9px",
    color: "#ddd6fe",
    wordBreak: "break-word" as const,
    lineHeight: 1.4,
  },
  contactIcon: {
    flexShrink: 0,
    width: "14px",
    textAlign: "center" as const,
    fontSize: "10px",
  },
  skillGroup: {
    marginBottom: "12px",
  },
  skillLabel: {
    fontSize: "9px",
    fontWeight: 600,
    color: "#e9d5ff",
    marginBottom: "6px",
    letterSpacing: "0.01em",
  },
  skillBar: {
    width: "100%",
    height: "5px",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: "3px",
    marginBottom: "6px",
    overflow: "hidden" as const,
  },
  skillFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: "3px",
  },
  langItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "9.5px",
    marginBottom: "4px",
    color: "#ddd6fe",
    padding: "2px 0",
  },
  langLevel: {
    fontSize: "8.5px",
    textTransform: "capitalize" as const,
    color: "#c4b5fd",
    fontWeight: 500,
  },
  refItem: {
    marginBottom: "8px",
    fontSize: "9.5px",
  },
  interestTag: {
    display: "inline-block",
    fontSize: "8.5px",
    padding: "3px 8px",
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#ddd6fe",
    borderRadius: "12px",
    marginRight: "3px",
    marginBottom: "4px",
  },
  rightCol: {
    flex: 1,
    padding: "34px 26px",
    boxSizing: "border-box" as const,
  },
  nameBlock: {
    marginBottom: "22px",
  },
  fullName: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1e1b4b",
    marginBottom: "3px",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  jobTitle: {
    fontSize: "12.5px",
    color: palette.primary,
    fontWeight: 500,
    letterSpacing: "0.02em",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#1e1b4b",
    marginBottom: "10px",
    paddingBottom: "0",
    paddingLeft: "12px",
    borderLeft: `3px solid ${palette.primary}`,
    lineHeight: 1.3,
  },
  summaryText: {
    fontSize: "11px",
    lineHeight: "1.65",
    color: "#374151",
    marginBottom: "18px",
  },
  expBlock: {
    marginBottom: "14px",
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
    lineHeight: 1.3,
  },
  expCompany: {
    fontSize: "10.5px",
    color: "#7c3aed",
    lineHeight: 1.3,
  },
  expDate: {
    fontSize: "9.5px",
    color: "#9ca3af",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    fontWeight: 500,
  },
  bullet: {
    fontSize: "10.5px",
    lineHeight: "1.55",
    color: "#374151",
    paddingLeft: "12px",
    position: "relative" as const,
    marginBottom: "3px",
  },
  bulletMarker: {
    position: "absolute" as const,
    left: "0",
    top: "6.5px",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: palette.primary,
  },
  eduDegree: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#1e1b4b",
    lineHeight: 1.3,
  },
  eduInstitution: {
    fontSize: "10.5px",
    color: "#6b7280",
    lineHeight: 1.3,
  },
  eduMeta: {
    fontSize: "9.5px",
    color: "#9ca3af",
    marginTop: "1px",
  },
  certItem: {
    fontSize: "11px",
    color: "#374151",
    marginBottom: "3px",
    fontWeight: 500,
  },
  certIssuer: {
    fontSize: "9.5px",
    color: "#9ca3af",
  },
  awardDesc: {
    fontSize: "9.5px",
    color: "#6b7280",
    marginTop: "2px",
    lineHeight: "1.5",
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
          <div style={{ marginBottom: "18px" }}>
            <div style={styles.contactSectionTitle}>
              Contact
              <div style={styles.sidebarDivider} />
            </div>
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
                <span style={{ ...styles.contactIcon, fontWeight: 700, fontSize: "9px" }}>in</span>
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
          <div style={{ marginBottom: "18px" }}>
            <div style={styles.contactSectionTitle}>
              Skills
              <div style={styles.sidebarDivider} />
            </div>
            {skills.map((group) => (
              <div key={group.id} style={styles.skillGroup}>
                <div style={styles.skillLabel}>{group.name}</div>
                {group.skills.map((skill, i) => (
                  <div key={i}>
                    <div style={{ fontSize: "8.5px", color: "#ddd6fe", marginBottom: "2px" }}>{skill}</div>
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
          <div style={{ marginBottom: "18px" }}>
            <div style={styles.contactSectionTitle}>
              Languages
              <div style={styles.sidebarDivider} />
            </div>
            {languages.map((lang) => (
              <div key={lang.id} style={styles.langItem}>
                <span>{lang.name}</span>
                <span style={styles.langLevel}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && sidebarSections.some((s) => s.type === "interests") && (
          <div style={{ marginBottom: "18px" }}>
            <div style={styles.contactSectionTitle}>
              Interests
              <div style={styles.sidebarDivider} />
            </div>
            <div>
              {interests.map((item) => (
                <span key={item.id} style={styles.interestTag}>{item.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {references.length > 0 && sidebarSections.some((s) => s.type === "references") && (
          <div style={{ marginBottom: "18px" }}>
            <div style={styles.contactSectionTitle}>
              References
              <div style={styles.sidebarDivider} />
            </div>
            {references.map((ref) => (
              <div key={ref.id} style={styles.refItem}>
                <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "9.5px" }}>{ref.name}</div>
                <div style={{ color: "#c4b5fd", fontSize: "9px" }}>{ref.role}</div>
                {ref.company && <div style={{ color: "#c4b5fd", fontSize: "9px" }}>{ref.company}</div>}
                {ref.email && <div style={{ color: "#a78bfa", fontSize: "9px", marginTop: "1px" }}>{ref.email}</div>}
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
          <section style={{ marginBottom: "18px" }}>
            <div style={styles.sectionTitle}>Professional Summary</div>
            <p style={styles.summaryText}>{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && mainSections.some((s) => s.type === "experience") && (
          <section style={{ marginBottom: "18px" }}>
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
                  <div style={{ marginTop: "5px" }}>
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
          <section style={{ marginBottom: "18px" }}>
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
                  <div style={{ marginTop: "5px" }}>
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
          <section style={{ marginBottom: "18px" }}>
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
          <section style={{ marginBottom: "18px" }}>
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
          <section style={{ marginBottom: "18px" }}>
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
              <section key={section.id} style={{ marginBottom: "18px" }}>
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
