"use client"

import type { ResumeData } from "@/types/resume"

const palette = {
  primary: "#4f46e5",
  dark: "#312e81",
  light: "#eef2ff",
  muted: "#e0e7ff",
  text: "#ffffff",
}

const mono = "'JetBrains Mono', monospace"
const sans = "Inter, -apple-system, BlinkMacSystemFont, sans-serif"

const styles = {
  page: {
    width: "210mm",
    minHeight: "297mm",
    fontFamily: sans,
    color: "#1e1b4b",
    backgroundColor: "#ffffff",
    display: "flex",
    boxSizing: "border-box" as const,
    fontSize: "11px",
    lineHeight: "1.5",
  },
  sidebar: {
    width: "32%",
    minWidth: "32%",
    backgroundColor: palette.dark,
    color: palette.text,
    padding: "28px 18px",
    boxSizing: "border-box" as const,
  },
  sidebarTitle: {
    fontFamily: mono,
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#a5b4fc",
    marginBottom: "8px",
    paddingBottom: "4px",
    borderBottom: "1px solid #4338ca",
  },
  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "5px",
    fontSize: "9.5px",
    color: "#c7d2fe",
    fontFamily: mono,
    wordBreak: "break-word" as const,
  },
  contactIcon: {
    flexShrink: 0,
    width: "14px",
    textAlign: "center" as const,
    fontSize: "10px",
    color: "#818cf8",
  },
  skillGroup: {
    marginBottom: "10px",
  },
  skillGroupLabel: {
    fontFamily: mono,
    fontSize: "9px",
    fontWeight: 600,
    color: "#a5b4fc",
    marginBottom: "4px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  skillTag: {
    display: "inline-block",
    fontFamily: mono,
    fontSize: "9px",
    padding: "2px 7px",
    backgroundColor: "#3730a3",
    color: "#c7d2fe",
    borderRadius: "3px",
    marginRight: "3px",
    marginBottom: "3px",
  },
  langItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "9.5px",
    marginBottom: "3px",
    color: "#c7d2fe",
  },
  main: {
    flex: 1,
    padding: "28px 24px",
    boxSizing: "border-box" as const,
  },
  headerName: {
    fontSize: "22px",
    fontWeight: 700,
    color: palette.dark,
    marginBottom: "2px",
    fontFamily: sans,
  },
  headerTitle: {
    fontSize: "12px",
    color: palette.primary,
    fontFamily: mono,
    marginBottom: "12px",
  },
  sectionTitle: {
    fontFamily: mono,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: palette.primary,
    marginBottom: "6px",
    paddingBottom: "4px",
    borderBottom: `2px solid ${palette.muted}`,
  },
  summaryText: {
    fontSize: "11px",
    lineHeight: "1.6",
    color: "#374151",
    marginBottom: "14px",
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
    color: "#6366f1",
    fontFamily: mono,
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
    paddingLeft: "14px",
    position: "relative" as const,
    marginBottom: "2px",
    fontFamily: mono,
  },
  bulletPrefix: {
    position: "absolute" as const,
    left: "0",
    color: palette.primary,
    fontWeight: 700,
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
  refItem: {
    marginBottom: "6px",
    fontSize: "10px",
  },
  awardDesc: {
    fontSize: "10px",
    color: "#6b7280",
    marginTop: "2px",
  },
}

export function DeveloperPortfolioTemplate({ resume }: { resume: ResumeData }) {
  const { content, sections } = resume
  const { contact, summary, experience, education, skills, languages, certifications, projects, awards, interests, references, custom } = content

  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order)

  const sidebarTypes = ["contact", "skills", "languages", "interests", "references"]
  const sidebarSections = visibleSections.filter((s) => sidebarTypes.includes(s.type))
  const mainSections = visibleSections.filter((s) => !sidebarTypes.includes(s.type))

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "2px" }}>
            {contact.fullName || "Your Name"}
          </div>
          <div style={{ fontSize: "11px", fontFamily: mono, color: "#a5b4fc" }}>
            {contact.title || "Job Title"}
          </div>
        </div>

        {/* Contact */}
        {sidebarSections.some((s) => s.type === "contact") && (
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.sidebarTitle}>&gt; contact</div>
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
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.sidebarTitle}>&gt; skills</div>
            {skills.map((group) => (
              <div key={group.id} style={styles.skillGroup}>
                <div style={styles.skillGroupLabel}>{group.name}</div>
                <div>
                  {group.skills.map((skill, i) => (
                    <span key={i} style={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && sidebarSections.some((s) => s.type === "languages") && (
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.sidebarTitle}>&gt; languages</div>
            {languages.map((lang) => (
              <div key={lang.id} style={styles.langItem}>
                <span>{lang.name}</span>
                <span style={{ color: "#818cf8" }}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && sidebarSections.some((s) => s.type === "interests") && (
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.sidebarTitle}>&gt; interests</div>
            <div>
              {interests.map((item) => (
                <span key={item.id} style={styles.skillTag}>{item.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {references.length > 0 && sidebarSections.some((s) => s.type === "references") && (
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.sidebarTitle}>&gt; references</div>
            {references.map((ref) => (
              <div key={ref.id} style={styles.refItem}>
                <div style={{ fontWeight: 600, color: "#e0e7ff" }}>{ref.name}</div>
                <div style={{ color: "#a5b4fc" }}>{ref.role}</div>
                {ref.company && <div style={{ color: "#a5b4fc" }}>{ref.company}</div>}
                {ref.email && <div style={{ color: "#818cf8" }}>{ref.email}</div>}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <div style={{ marginBottom: "14px" }}>
          <div style={styles.headerName}>{contact.fullName || "Your Name"}</div>
          <div style={styles.headerTitle}>{contact.title || "Job Title"}</div>
        </div>

        {/* Summary */}
        {summary && mainSections.some((s) => s.type === "summary") && (
          <section style={{ marginBottom: "14px" }}>
            <div style={styles.sectionTitle}>&#9654; Summary</div>
            <p style={styles.summaryText}>{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && mainSections.some((s) => s.type === "experience") && (
          <section style={{ marginBottom: "14px" }}>
            <div style={styles.sectionTitle}>&#9654; Experience</div>
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
                        <span style={styles.bulletPrefix}>&gt; </span>
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
          <section style={{ marginBottom: "14px" }}>
            <div style={styles.sectionTitle}>&#9654; Projects</div>
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
                        <span style={styles.bulletPrefix}>&gt; </span>
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
          <section style={{ marginBottom: "14px" }}>
            <div style={styles.sectionTitle}>&#9654; Education</div>
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
          <section style={{ marginBottom: "14px" }}>
            <div style={styles.sectionTitle}>&#9654; Certifications</div>
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
          <section style={{ marginBottom: "14px" }}>
            <div style={styles.sectionTitle}>&#9654; Awards</div>
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
              <section key={section.id} style={{ marginBottom: "14px" }}>
                <div style={styles.sectionTitle}>&#9654; {section.title}</div>
                {section.content && <p style={styles.summaryText}>{section.content}</p>}
                {section.bullets.length > 0 && (
                  <div>
                    {section.bullets.map((bullet, i) => (
                      <div key={i} style={styles.bullet}>
                        <span style={styles.bulletPrefix}>&gt; </span>
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
