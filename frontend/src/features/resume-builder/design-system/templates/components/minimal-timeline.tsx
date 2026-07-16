"use client"

import type { ResumeData } from "@/types/resume"

const palette = {
  primary: "#18181b",
  light: "#f4f4f5",
  muted: "#e4e4e7",
  text: "#ffffff",
}

const styles = {
  page: {
    width: "210mm",
    minHeight: "297mm",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#18181b",
    backgroundColor: "#ffffff",
    display: "flex",
    padding: "0",
    boxSizing: "border-box" as const,
    fontSize: "11px",
    lineHeight: "1.5",
  },
  sidebar: {
    width: "30%",
    minWidth: "30%",
    backgroundColor: palette.primary,
    color: palette.text,
    padding: "28px 20px",
    boxSizing: "border-box" as const,
  },
  sidebarSectionTitle: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#a1a1aa",
    marginBottom: "8px",
    paddingBottom: "4px",
    borderBottom: `1px solid #3f3f46`,
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "5px",
    fontSize: "10px",
    color: "#d4d4d8",
    wordBreak: "break-word" as const,
  },
  contactIcon: {
    flexShrink: 0,
    width: "14px",
    textAlign: "center" as const,
    fontSize: "10px",
  },
  skillGroup: {
    marginBottom: "8px",
  },
  skillGroupName: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#e4e4e7",
    marginBottom: "3px",
  },
  skillTag: {
    display: "inline-block",
    fontSize: "9px",
    padding: "2px 6px",
    backgroundColor: "#27272a",
    color: "#d4d4d8",
    borderRadius: "3px",
    marginRight: "3px",
    marginBottom: "3px",
  },
  mainArea: {
    flex: 1,
    padding: "28px 24px",
    position: "relative" as const,
    boxSizing: "border-box" as const,
  },
  timelineLine: {
    position: "absolute" as const,
    left: "12px",
    top: "28px",
    bottom: "28px",
    width: "1px",
    backgroundColor: "#e4e4e7",
  },
  timelineDot: {
    position: "absolute" as const,
    left: "8px",
    top: "4px",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    backgroundColor: palette.primary,
    border: "2px solid #ffffff",
    zIndex: 1,
  },
  section: {
    position: "relative" as const,
    marginBottom: "16px",
    paddingLeft: "16px",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: palette.primary,
    marginBottom: "6px",
    paddingBottom: "3px",
    borderBottom: `1.5px solid ${palette.muted}`,
  },
  summaryText: {
    fontSize: "11px",
    lineHeight: "1.6",
    color: "#3f3f46",
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
    color: "#18181b",
  },
  expCompany: {
    fontSize: "11px",
    color: "#52525b",
  },
  expDate: {
    fontSize: "10px",
    color: "#a1a1aa",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  bullet: {
    fontSize: "11px",
    lineHeight: "1.55",
    color: "#3f3f46",
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
    backgroundColor: "#a1a1aa",
  },
  itemBlock: {
    marginBottom: "10px",
  },
  langItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "10px",
    marginBottom: "3px",
    color: "#3f3f46",
  },
  eduDegree: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#18181b",
  },
  eduInstitution: {
    fontSize: "11px",
    color: "#52525b",
  },
  eduMeta: {
    fontSize: "10px",
    color: "#a1a1aa",
  },
  certItem: {
    fontSize: "11px",
    color: "#3f3f46",
    marginBottom: "4px",
  },
  certIssuer: {
    fontSize: "10px",
    color: "#71717a",
  },
  projectBullets: {
    marginTop: "3px",
  },
}

export function MinimalTimelineTemplate({ resume }: { resume: ResumeData }) {
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
        {/* Name in sidebar */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "2px" }}>
            {contact.fullName || "Your Name"}
          </div>
          <div style={{ fontSize: "11px", color: "#a1a1aa" }}>
            {contact.title || "Job Title"}
          </div>
        </div>

        {/* Contact */}
        {sidebarSections.some((s) => s.type === "contact") && (
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.sidebarSectionTitle}>Contact</div>
            {contact.email && (
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>&#9993;</span>
                <span>{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>&#9742;</span>
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.location && (
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>&#9906;</span>
                <span>{contact.location}</span>
              </div>
            )}
            {contact.website && (
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>&#128279;</span>
                <span>{contact.website}</span>
              </div>
            )}
            {contact.linkedin && (
              <div style={styles.contactItem}>
                <span style={{ ...styles.contactIcon, fontWeight: 700 }}>in</span>
                <span>{contact.linkedin}</span>
              </div>
            )}
            {contact.github && (
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>&#128187;</span>
                <span>{contact.github}</span>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && sidebarSections.some((s) => s.type === "skills") && (
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.sidebarSectionTitle}>Skills</div>
            {skills.map((group) => (
              <div key={group.id} style={styles.skillGroup}>
                <div style={styles.skillGroupName}>{group.name}</div>
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
            <div style={styles.sidebarSectionTitle}>Languages</div>
            {languages.map((lang) => (
              <div key={lang.id} style={styles.langItem}>
                <span>{lang.name}</span>
                <span style={{ color: "#71717a", textTransform: "capitalize" }}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && sidebarSections.some((s) => s.type === "interests") && (
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.sidebarSectionTitle}>Interests</div>
            <div>
              {interests.map((item) => (
                <span key={item.id} style={{ ...styles.skillTag, backgroundColor: "#27272a" }}>
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {references.length > 0 && sidebarSections.some((s) => s.type === "references") && (
          <div style={{ marginBottom: "14px" }}>
            <div style={styles.sidebarSectionTitle}>References</div>
            {references.map((ref) => (
              <div key={ref.id} style={{ marginBottom: "8px", fontSize: "10px" }}>
                <div style={{ fontWeight: 600, color: "#e4e4e7" }}>{ref.name}</div>
                <div style={{ color: "#a1a1aa" }}>{ref.role}</div>
                {ref.company && <div style={{ color: "#a1a1aa" }}>{ref.company}</div>}
                {ref.email && <div style={{ color: "#71717a" }}>{ref.email}</div>}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Area with Timeline */}
      <main style={styles.mainArea}>
        <div style={styles.timelineLine} />

        {/* Summary */}
        {summary && mainSections.some((s) => s.type === "summary") && (
          <section style={styles.section}>
            <div style={styles.timelineDot} />
            <div style={styles.sectionTitle}>Professional Summary</div>
            <p style={styles.summaryText}>{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && mainSections.some((s) => s.type === "experience") && (
          <section style={styles.section}>
            <div style={styles.timelineDot} />
            <div style={styles.sectionTitle}>Experience</div>
            {experience.map((exp) => (
              <div key={exp.id} style={styles.itemBlock}>
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
                  <div style={styles.projectBullets}>
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
          <section style={styles.section}>
            <div style={styles.timelineDot} />
            <div style={styles.sectionTitle}>Projects</div>
            {projects.map((proj) => (
              <div key={proj.id} style={styles.itemBlock}>
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
                  <div style={styles.projectBullets}>
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
          <section style={styles.section}>
            <div style={styles.timelineDot} />
            <div style={styles.sectionTitle}>Education</div>
            {education.map((edu) => (
              <div key={edu.id} style={styles.itemBlock}>
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
          <section style={styles.section}>
            <div style={styles.timelineDot} />
            <div style={styles.sectionTitle}>Certifications</div>
            {certifications.map((cert) => (
              <div key={cert.id} style={styles.itemBlock}>
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
          <section style={styles.section}>
            <div style={styles.timelineDot} />
            <div style={styles.sectionTitle}>Awards</div>
            {awards.map((award) => (
              <div key={award.id} style={styles.itemBlock}>
                <div style={styles.expHeader}>
                  <div>
                    <div style={styles.certItem}>{award.name}</div>
                    {award.issuer && <div style={styles.certIssuer}>{award.issuer}</div>}
                  </div>
                  {award.date && <div style={styles.expDate}>{award.date}</div>}
                </div>
                {award.description && (
                  <div style={{ fontSize: "10px", color: "#52525b", marginTop: "2px" }}>
                    {award.description}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Custom Sections */}
        {custom.length > 0 && mainSections.some((s) => s.type === "custom") && (
          <>
            {custom.map((section) => (
              <section key={section.id} style={styles.section}>
                <div style={styles.timelineDot} />
                <div style={styles.sectionTitle}>{section.title}</div>
                {section.content && (
                  <p style={styles.summaryText}>{section.content}</p>
                )}
                {section.bullets.length > 0 && (
                  <div style={styles.projectBullets}>
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
