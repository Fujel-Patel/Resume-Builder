"use client"

import type { ResumeData } from "@/types/resume"

const palette = {
  primary: "#059669",
  light: "#ecfdf5",
  muted: "#d1fae5",
  dark: "#064e3b",
  text: "#ffffff",
}

const sans = "Inter, -apple-system, BlinkMacSystemFont, sans-serif"

const styles = {
  page: {
    width: "210mm",
    minHeight: "297mm",
    fontFamily: sans,
    color: "#111827",
    backgroundColor: "#ffffff",
    boxSizing: "border-box" as const,
    fontSize: "11px",
    lineHeight: "1.5",
  },
  header: {
    backgroundColor: palette.primary,
    color: palette.text,
    padding: "32px 36px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
  },
  headerLeft: {
    flex: 1,
  },
  fullName: {
    fontSize: "36px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    marginBottom: "4px",
  },
  jobTitle: {
    fontSize: "15px",
    fontWeight: 400,
    color: "#a7f3d0",
    marginBottom: "12px",
  },
  contactRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "6px 16px",
    fontSize: "10px",
    color: "#d1fae5",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  contactIcon: {
    fontSize: "11px",
  },
  body: {
    padding: "28px 36px",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: palette.primary,
    marginBottom: "10px",
    paddingBottom: "4px",
    borderBottom: `2px solid ${palette.muted}`,
  },
  section: {
    marginBottom: "22px",
  },
  summaryText: {
    fontSize: "12px",
    lineHeight: "1.65",
    color: "#374151",
  },
  expBlock: {
    marginBottom: "14px",
    padding: "10px 14px",
    backgroundColor: palette.light,
    borderRadius: "6px",
    borderLeft: `3px solid ${palette.primary}`,
  },
  expHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
  },
  expRole: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#064e3b",
  },
  expCompany: {
    fontSize: "11px",
    color: "#059669",
  },
  expDate: {
    fontSize: "10px",
    color: "#6b7280",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  bullet: {
    fontSize: "11px",
    lineHeight: "1.55",
    color: "#374151",
    paddingLeft: "12px",
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
  projectCard: {
    padding: "12px 14px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    marginBottom: "10px",
  },
  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "4px",
  },
  projectName: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#111827",
  },
  projectDate: {
    fontSize: "10px",
    color: "#9ca3af",
    whiteSpace: "nowrap" as const,
  },
  eduDegree: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#111827",
  },
  eduInstitution: {
    fontSize: "11px",
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
  langItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "10px",
    color: "#374151",
    marginRight: "12px",
    marginBottom: "4px",
  },
  langDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: palette.primary,
    flexShrink: 0,
  },
  refItem: {
    marginBottom: "8px",
    fontSize: "10px",
  },
}

export function StartupFounderTemplate({ resume }: { resume: ResumeData }) {
  const { content, sections } = resume
  const { contact, summary, experience, education, skills, languages, certifications, projects, awards, interests, references, custom } = content

  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order)

  return (
    <div style={styles.page}>
      {/* Full-width Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.fullName}>{contact.fullName || "Your Name"}</div>
          <div style={styles.jobTitle}>{contact.title || "Job Title"}</div>
          <div style={styles.contactRow}>
            {contact.email && (
              <span style={styles.contactItem}>
                <span style={styles.contactIcon}>&#9993;</span> {contact.email}
              </span>
            )}
            {contact.phone && (
              <span style={styles.contactItem}>
                <span style={styles.contactIcon}>&#9742;</span> {contact.phone}
              </span>
            )}
            {contact.location && (
              <span style={styles.contactItem}>
                <span style={styles.contactIcon}>&#9906;</span> {contact.location}
              </span>
            )}
            {contact.website && (
              <span style={styles.contactItem}>
                <span style={styles.contactIcon}>&#128279;</span> {contact.website}
              </span>
            )}
            {contact.linkedin && (
              <span style={styles.contactItem}>
                <span style={{ fontWeight: 700 }}>in</span> {contact.linkedin}
              </span>
            )}
            {contact.github && (
              <span style={styles.contactItem}>
                <span style={styles.contactIcon}>&#128187;</span> {contact.github}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={styles.body}>
        {/* Summary */}
        {summary && visibleSections.some((s) => s.type === "summary") && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>About</div>
            <p style={styles.summaryText}>{summary}</p>
          </section>
        )}

        {/* Projects - prominent */}
        {projects.length > 0 && visibleSections.some((s) => s.type === "projects") && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Projects</div>
            {projects.map((proj) => (
              <div key={proj.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <div>
                    <span style={styles.projectName}>{proj.name}</span>
                    {proj.role && (
                      <span style={{ fontSize: "11px", color: "#6b7280", marginLeft: "6px" }}>
                        {proj.role}
                      </span>
                    )}
                    {proj.url && (
                      <span style={{ fontSize: "10px", color: palette.primary, marginLeft: "6px" }}>
                        {proj.url}
                      </span>
                    )}
                  </div>
                  {(proj.startDate || proj.endDate) && (
                    <span style={styles.projectDate}>
                      {proj.startDate}
                      {proj.startDate && proj.endDate ? " \u2013 " : ""}
                      {proj.endDate}
                    </span>
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

        {/* Experience */}
        {experience.length > 0 && visibleSections.some((s) => s.type === "experience") && (
          <section style={styles.section}>
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

        {/* Education */}
        {education.length > 0 && visibleSections.some((s) => s.type === "education") && (
          <section style={styles.section}>
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

        {/* Skills */}
        {skills.length > 0 && visibleSections.some((s) => s.type === "skills") && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Skills</div>
            {skills.map((group) => (
              <div key={group.id} style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#111827", marginBottom: "3px" }}>
                  {group.name}
                </div>
                <div style={{ fontSize: "11px", color: "#374151" }}>
                  {group.skills.join(" \u2022 ")}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && visibleSections.some((s) => s.type === "certifications") && (
          <section style={styles.section}>
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

        {/* Languages */}
        {languages.length > 0 && visibleSections.some((s) => s.type === "languages") && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Languages</div>
            <div>
              {languages.map((lang) => (
                <span key={lang.id} style={styles.langItem}>
                  <span style={styles.langDot} />
                  {lang.name} ({lang.proficiency})
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Awards */}
        {awards.length > 0 && visibleSections.some((s) => s.type === "awards") && (
          <section style={styles.section}>
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

        {/* Interests */}
        {interests.length > 0 && visibleSections.some((s) => s.type === "interests") && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>Interests</div>
            <div style={{ fontSize: "11px", color: "#374151" }}>
              {interests.map((item) => item.name).join(" \u2022 ")}
            </div>
          </section>
        )}

        {/* References */}
        {references.length > 0 && visibleSections.some((s) => s.type === "references") && (
          <section style={styles.section}>
            <div style={styles.sectionTitle}>References</div>
            {references.map((ref) => (
              <div key={ref.id} style={styles.refItem}>
                <div style={{ fontWeight: 600, color: "#111827" }}>{ref.name}</div>
                <div style={{ color: "#6b7280" }}>{ref.role}{ref.company ? ` at ${ref.company}` : ""}</div>
                {ref.email && <div style={{ color: "#9ca3af" }}>{ref.email}</div>}
              </div>
            ))}
          </section>
        )}

        {/* Custom Sections */}
        {custom.length > 0 && visibleSections.some((s) => s.type === "custom") && (
          <>
            {custom.map((section) => (
              <section key={section.id} style={styles.section}>
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
      </div>
    </div>
  )
}
