"use client"

import type { ResumeData } from "@/types/resume"

const palette = {
  primary: "#4682b4",
  light: "#f0f7ff",
  muted: "#dbeafe",
  dark: "#1e3a5f",
  text: "#ffffff",
}

const sans = "Inter, -apple-system, BlinkMacSystemFont, sans-serif"

const styles = {
  page: {
    width: "210mm",
    minHeight: "297mm",
    fontFamily: sans,
    color: "#1f2937",
    backgroundColor: "#ffffff",
    boxSizing: "border-box" as const,
    fontSize: "11px",
    lineHeight: "1.5",
    padding: "32px 36px",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: `2px solid ${palette.primary}`,
  },
  fullName: {
    fontSize: "24px",
    fontWeight: 700,
    color: palette.dark,
    letterSpacing: "-0.01em",
    marginBottom: "4px",
  },
  jobTitle: {
    fontSize: "12px",
    color: palette.primary,
    fontWeight: 500,
    marginBottom: "10px",
  },
  contactRow: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap" as const,
    gap: "4px 14px",
    fontSize: "10px",
    color: "#6b7280",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  contactIcon: {
    fontSize: "11px",
    color: palette.primary,
  },
  section: {
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: palette.dark,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
    paddingBottom: "3px",
    borderBottom: `1px solid ${palette.muted}`,
  },
  summaryText: {
    fontSize: "11px",
    lineHeight: "1.6",
    color: "#374151",
  },
  eduBlock: {
    marginBottom: "10px",
    padding: "8px 12px",
    backgroundColor: palette.light,
    borderRadius: "4px",
  },
  eduHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
  },
  eduDegree: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#1f2937",
  },
  eduDate: {
    fontSize: "10px",
    color: "#9ca3af",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  eduInstitution: {
    fontSize: "11px",
    color: "#6b7280",
  },
  eduGpa: {
    fontSize: "10px",
    color: "#9ca3af",
    marginTop: "2px",
  },
  expBlock: {
    marginBottom: "10px",
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
    color: "#1f2937",
  },
  expCompany: {
    fontSize: "11px",
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
    width: "3px",
    height: "3px",
    borderRadius: "50%",
    backgroundColor: palette.primary,
  },
  projectBlock: {
    marginBottom: "10px",
  },
  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
  },
  projectName: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#1f2937",
  },
  projectDate: {
    fontSize: "10px",
    color: "#9ca3af",
    whiteSpace: "nowrap" as const,
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
  skillSection: {
    marginBottom: "4px",
  },
  skillLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#1f2937",
    display: "inline",
  },
  skillList: {
    fontSize: "11px",
    color: "#374151",
    display: "inline",
  },
  langItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "10px",
    color: "#374151",
    marginRight: "12px",
    marginBottom: "3px",
  },
  langDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: palette.primary,
    flexShrink: 0,
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

export function GraduateEntryTemplate({ resume }: { resume: ResumeData }) {
  const { content, sections } = resume
  const { contact, summary, experience, education, skills, languages, certifications, projects, awards, interests, references, custom } = content

  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order)

  // Education comes first for graduate template, regardless of config order
  const reorderedSections = visibleSections.sort((a, b) => {
    if (a.type === "education") return -1
    if (b.type === "education") return 1
    return a.order - b.order
  })

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
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
              <span style={{ ...styles.contactIcon, fontWeight: 700 }}>in</span> {contact.linkedin}
            </span>
          )}
          {contact.github && (
            <span style={styles.contactItem}>
              <span style={styles.contactIcon}>&#128187;</span> {contact.github}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && reorderedSections.some((s) => s.type === "summary") && (
        <section style={styles.section}>
          <div style={styles.sectionTitle}>Professional Summary</div>
          <p style={styles.summaryText}>{summary}</p>
        </section>
      )}

      {/* Education - prominent, first */}
      {education.length > 0 && reorderedSections.some((s) => s.type === "education") && (
        <section style={styles.section}>
          <div style={styles.sectionTitle}>Education</div>
          {education.map((edu) => (
            <div key={edu.id} style={styles.eduBlock}>
              <div style={styles.eduHeader}>
                <div>
                  <div style={styles.eduDegree}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                  </div>
                  <div style={styles.eduInstitution}>{edu.institution}</div>
                  {edu.gpa && <div style={styles.eduGpa}>GPA: {edu.gpa}</div>}
                </div>
                {(edu.startDate || edu.endDate) && (
                  <div style={styles.eduDate}>
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

      {/* Projects - prominent for graduates */}
      {projects.length > 0 && reorderedSections.some((s) => s.type === "projects") && (
        <section style={styles.section}>
          <div style={styles.sectionTitle}>Projects</div>
          {projects.map((proj) => (
            <div key={proj.id} style={styles.projectBlock}>
              <div style={styles.projectHeader}>
                <div>
                  <span style={styles.projectName}>{proj.name}</span>
                  {proj.role && (
                    <span style={{ fontSize: "11px", color: "#6b7280", marginLeft: "6px" }}>
                      {proj.role}
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
                <div style={{ marginTop: "3px" }}>
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

      {/* Skills */}
      {skills.length > 0 && reorderedSections.some((s) => s.type === "skills") && (
        <section style={styles.section}>
          <div style={styles.sectionTitle}>Skills</div>
          {skills.map((group) => (
            <div key={group.id} style={styles.skillSection}>
              <span style={styles.skillLabel}>{group.name}: </span>
              <span style={styles.skillList}>{group.skills.join(", ")}</span>
            </div>
          ))}
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && reorderedSections.some((s) => s.type === "experience") && (
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
                <div style={{ marginTop: "3px" }}>
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

      {/* Certifications */}
      {certifications.length > 0 && reorderedSections.some((s) => s.type === "certifications") && (
        <section style={styles.section}>
          <div style={styles.sectionTitle}>Certifications</div>
          {certifications.map((cert) => (
            <div key={cert.id} style={{ marginBottom: "4px" }}>
              <div style={styles.expHeader}>
                <div>
                  <span style={styles.certItem}>{cert.name}</span>
                  {cert.issuer && <span style={{ ...styles.certIssuer, marginLeft: "6px" }}>{cert.issuer}</span>}
                </div>
                {cert.date && <span style={styles.expDate}>{cert.date}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && reorderedSections.some((s) => s.type === "languages") && (
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
      {awards.length > 0 && reorderedSections.some((s) => s.type === "awards") && (
        <section style={styles.section}>
          <div style={styles.sectionTitle}>Awards</div>
          {awards.map((award) => (
            <div key={award.id} style={{ marginBottom: "6px" }}>
              <div style={styles.expHeader}>
                <div>
                  <span style={styles.certItem}>{award.name}</span>
                  {award.issuer && <span style={{ ...styles.certIssuer, marginLeft: "6px" }}>{award.issuer}</span>}
                </div>
                {award.date && <span style={styles.expDate}>{award.date}</span>}
              </div>
              {award.description && <div style={styles.awardDesc}>{award.description}</div>}
            </div>
          ))}
        </section>
      )}

      {/* Interests */}
      {interests.length > 0 && reorderedSections.some((s) => s.type === "interests") && (
        <section style={styles.section}>
          <div style={styles.sectionTitle}>Interests</div>
          <div style={{ fontSize: "11px", color: "#374151" }}>
            {interests.map((item) => item.name).join(" \u2022 ")}
          </div>
        </section>
      )}

      {/* References */}
      {references.length > 0 && reorderedSections.some((s) => s.type === "references") && (
        <section style={styles.section}>
          <div style={styles.sectionTitle}>References</div>
          {references.map((ref) => (
            <div key={ref.id} style={styles.refItem}>
              <div style={{ fontWeight: 600, color: "#1f2937" }}>{ref.name}</div>
              <div style={{ color: "#6b7280" }}>{ref.role}{ref.company ? ` at ${ref.company}` : ""}</div>
              {ref.email && <div style={{ color: "#9ca3af" }}>{ref.email}</div>}
            </div>
          ))}
        </section>
      )}

      {/* Custom Sections */}
      {custom.length > 0 && reorderedSections.some((s) => s.type === "custom") && (
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
  )
}
