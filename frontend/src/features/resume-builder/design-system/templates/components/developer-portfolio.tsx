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
    width: "794px",
    minHeight: "1123px",
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
    padding: "30px 18px",
    boxSizing: "border-box" as const,
  },
  sidebarTitle: {
    fontFamily: mono,
    fontSize: "9px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "#818cf8",
    marginBottom: "10px",
    paddingBottom: "0",
    borderBottom: "none",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
  },
  sidebarDivider: {
    flex: 1,
    height: "1px",
    backgroundColor: "#4338ca",
  },
  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginBottom: "6px",
    fontSize: "9px",
    color: "#c7d2fe",
    fontFamily: mono,
    wordBreak: "break-word" as const,
    lineHeight: 1.4,
  },
  contactIcon: {
    flexShrink: 0,
    width: "14px",
    textAlign: "center" as const,
    fontSize: "10px",
    color: "#818cf8",
  },
  skillGroup: {
    marginBottom: "12px",
  },
  skillGroupLabel: {
    fontFamily: mono,
    fontSize: "8.5px",
    fontWeight: 600,
    color: "#a5b4fc",
    marginBottom: "5px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
  skillTag: {
    display: "inline-block",
    fontFamily: mono,
    fontSize: "8.5px",
    padding: "2.5px 8px",
    backgroundColor: "#3730a3",
    color: "#c7d2fe",
    borderRadius: "4px",
    marginRight: "3px",
    marginBottom: "3px",
    letterSpacing: "0.01em",
  },
  langItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "9px",
    marginBottom: "4px",
    color: "#c7d2fe",
    fontFamily: mono,
  },
  langLevel: {
    color: "#818cf8",
    fontSize: "8.5px",
    textTransform: "capitalize" as const,
  },
  main: {
    flex: 1,
    padding: "30px 26px",
    boxSizing: "border-box" as const,
  },
  headerName: {
    fontSize: "22px",
    fontWeight: 700,
    color: palette.dark,
    marginBottom: "2px",
    fontFamily: sans,
    letterSpacing: "-0.02em",
  },
  headerTitle: {
    fontSize: "11.5px",
    color: palette.primary,
    fontFamily: mono,
    marginBottom: "14px",
    letterSpacing: "0.02em",
  },
  sectionTitle: {
    fontFamily: mono,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: palette.primary,
    marginBottom: "8px",
    paddingBottom: "0",
    borderBottom: "none",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
  },
  sectionDivider: {
    flex: 1,
    height: "2px",
    background: `linear-gradient(to right, ${palette.muted}, transparent)`,
  },
  summaryText: {
    fontSize: "11px",
    lineHeight: "1.65",
    color: "#374151",
    marginBottom: "16px",
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
    fontSize: "10px",
    color: "#6366f1",
    fontFamily: mono,
    lineHeight: 1.3,
  },
  expDate: {
    fontSize: "9.5px",
    color: "#9ca3af",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    fontFamily: mono,
    fontWeight: 500,
  },
  bullet: {
    fontSize: "10.5px",
    lineHeight: "1.55",
    color: "#374151",
    paddingLeft: "16px",
    position: "relative" as const,
    marginBottom: "3px",
  },
  bulletPrefix: {
    position: "absolute" as const,
    left: "0",
    color: palette.primary,
    fontWeight: 700,
    fontFamily: mono,
    fontSize: "10px",
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
    fontFamily: mono,
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
    fontFamily: mono,
  },
  refItem: {
    marginBottom: "8px",
    fontSize: "9.5px",
  },
  awardDesc: {
    fontSize: "9.5px",
    color: "#6b7280",
    marginTop: "2px",
    lineHeight: "1.5",
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
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "3px", letterSpacing: "-0.01em" }}>
            {contact.fullName || "Your Name"}
          </div>
          <div style={{ fontSize: "10px", fontFamily: mono, color: "#818cf8", letterSpacing: "0.02em" }}>
            {contact.title || "Job Title"}
          </div>
        </div>

        {/* Contact */}
        {sidebarSections.some((s) => s.type === "contact") && (
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.sidebarTitle}>
              &gt; contact
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
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.sidebarTitle}>
              &gt; skills
              <div style={styles.sidebarDivider} />
            </div>
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
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.sidebarTitle}>
              &gt; languages
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
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.sidebarTitle}>
              &gt; interests
              <div style={styles.sidebarDivider} />
            </div>
            <div>
              {interests.map((item) => (
                <span key={item.id} style={styles.skillTag}>{item.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {references.length > 0 && sidebarSections.some((s) => s.type === "references") && (
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.sidebarTitle}>
              &gt; references
              <div style={styles.sidebarDivider} />
            </div>
            {references.map((ref) => (
              <div key={ref.id} style={styles.refItem}>
                <div style={{ fontWeight: 600, color: "#e0e7ff", fontSize: "9.5px" }}>{ref.name}</div>
                <div style={{ color: "#a5b4fc", fontFamily: mono, fontSize: "8.5px" }}>{ref.role}</div>
                {ref.company && <div style={{ color: "#a5b4fc", fontFamily: mono, fontSize: "8.5px" }}>{ref.company}</div>}
                {ref.email && <div style={{ color: "#818cf8", fontFamily: mono, fontSize: "8.5px", marginTop: "1px" }}>{ref.email}</div>}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <div style={{ marginBottom: "16px" }}>
          <div style={styles.headerName}>{contact.fullName || "Your Name"}</div>
          <div style={styles.headerTitle}>{contact.title || "Job Title"}</div>
        </div>

        {/* Summary */}
        {summary && mainSections.some((s) => s.type === "summary") && (
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>
              &#9654; Summary
              <div style={styles.sectionDivider} />
            </div>
            <p style={styles.summaryText}>{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && mainSections.some((s) => s.type === "experience") && (
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>
              &#9654; Experience
              <div style={styles.sectionDivider} />
            </div>
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
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>
              &#9654; Projects
              <div style={styles.sectionDivider} />
            </div>
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
          <section style={{ marginBottom: "16px" }}>
            <div style={styles.sectionTitle}>
              &#9654; Education
              <div style={styles.sectionDivider} />
            </div>
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
            <div style={styles.sectionTitle}>
              &#9654; Certifications
              <div style={styles.sectionDivider} />
            </div>
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
            <div style={styles.sectionTitle}>
              &#9654; Awards
              <div style={styles.sectionDivider} />
            </div>
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
                <div style={styles.sectionTitle}>
                  &#9654; {section.title}
                  <div style={styles.sectionDivider} />
                </div>
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
