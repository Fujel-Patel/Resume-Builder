"use client"

import type { ResumeData } from "@/types/resume"

const palette = {
  primary: "#18181b",
  light: "#f4f4f5",
  muted: "#e4e4e7",
  text: "#ffffff",
  accent: "#3f3f46",
}

const styles = {
  page: {
    width: "794px",
    minHeight: "1123px",
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
    padding: "30px 20px",
    boxSizing: "border-box" as const,
  },
  sidebarSectionTitle: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#71717a",
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
    backgroundColor: "#3f3f46",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
    fontSize: "9.5px",
    color: "#d4d4d8",
    wordBreak: "break-word" as const,
  },
  contactIcon: {
    flexShrink: 0,
    width: "14px",
    textAlign: "center" as const,
    fontSize: "10px",
    color: "#71717a",
  },
  skillGroup: {
    marginBottom: "10px",
  },
  skillGroupName: {
    fontSize: "9.5px",
    fontWeight: 600,
    color: "#e4e4e7",
    marginBottom: "5px",
    letterSpacing: "0.01em",
  },
  skillTag: {
    display: "inline-block",
    fontSize: "8.5px",
    padding: "2px 7px",
    backgroundColor: "#27272a",
    color: "#d4d4d8",
    borderRadius: "3px",
    marginRight: "3px",
    marginBottom: "3px",
    letterSpacing: "0.01em",
  },
  mainArea: {
    flex: 1,
    padding: "24px 28px",
    position: "relative" as const,
    boxSizing: "border-box" as const,
  },
  timelineLine: {
    position: "absolute" as const,
    left: "14px",
    top: "30px",
    bottom: "30px",
    width: "1.5px",
    background: "linear-gradient(to bottom, #e4e4e7 0%, #d4d4d8 50%, #e4e4e7 100%)",
  },
  timelineDot: {
    position: "absolute" as const,
    left: "10px",
    top: "2px",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    backgroundColor: palette.primary,
    border: "2.5px solid #ffffff",
    zIndex: 1,
  },
  section: {
    position: "relative" as const,
    marginBottom: "12px",
    paddingLeft: "18px",
  },
  sectionTitle: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: palette.primary,
    marginBottom: "8px",
    paddingBottom: "0",
    borderBottom: "none",
  },
  summaryText: {
    fontSize: "11px",
    lineHeight: "1.65",
    color: "#52525b",
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
    lineHeight: 1.35,
  },
  expCompany: {
    fontSize: "10.5px",
    color: "#71717a",
    lineHeight: 1.35,
  },
  expDate: {
    fontSize: "9.5px",
    color: "#a1a1aa",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    fontWeight: 500,
  },
  bullet: {
    fontSize: "10.5px",
    lineHeight: "1.55",
    color: "#52525b",
    paddingLeft: "12px",
    position: "relative" as const,
    marginBottom: "3px",
  },
  bulletMarker: {
    position: "absolute" as const,
    left: "0",
    top: "6.5px",
    width: "3.5px",
    height: "3.5px",
    borderRadius: "50%",
    backgroundColor: "#a1a1aa",
  },
  itemBlock: {
    marginBottom: "8px",
  },
  langItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "9.5px",
    marginBottom: "4px",
    color: "#d4d4d8",
    padding: "2px 0",
  },
  langLevel: {
    fontSize: "8.5px",
    color: "#71717a",
    textTransform: "capitalize" as const,
    fontWeight: 500,
    backgroundColor: "#27272a",
    padding: "1px 6px",
    borderRadius: "3px",
  },
  eduDegree: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#18181b",
    lineHeight: 1.35,
  },
  eduInstitution: {
    fontSize: "10.5px",
    color: "#71717a",
    lineHeight: 1.35,
  },
  eduMeta: {
    fontSize: "9.5px",
    color: "#a1a1aa",
    marginTop: "1px",
  },
  certItem: {
    fontSize: "11px",
    color: "#3f3f46",
    fontWeight: 500,
    marginBottom: "3px",
  },
  certIssuer: {
    fontSize: "9.5px",
    color: "#71717a",
  },
  projectBullets: {
    marginTop: "4px",
  },
  awardDesc: {
    fontSize: "9.5px",
    color: "#71717a",
    marginTop: "2px",
    lineHeight: "1.5",
  },
  refItem: {
    marginBottom: "8px",
    fontSize: "9.5px",
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
        {/* Name */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "3px", letterSpacing: "-0.01em" }}>
            {contact.fullName || "Your Name"}
          </div>
          <div style={{ fontSize: "10px", color: "#a1a1aa", letterSpacing: "0.02em" }}>
            {contact.title || "Job Title"}
          </div>
        </div>

        {/* Contact */}
        {sidebarSections.some((s) => s.type === "contact") && (
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.sidebarSectionTitle}>
              Contact
              <div style={styles.sidebarDivider} />
            </div>
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
                <span style={{ ...styles.contactIcon, fontWeight: 700, fontSize: "9px" }}>in</span>
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
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.sidebarSectionTitle}>
              Skills
              <div style={styles.sidebarDivider} />
            </div>
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
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.sidebarSectionTitle}>
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
          <div style={{ marginBottom: "16px" }}>
            <div style={styles.sidebarSectionTitle}>
              Interests
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
            <div style={styles.sidebarSectionTitle}>
              References
              <div style={styles.sidebarDivider} />
            </div>
            {references.map((ref) => (
              <div key={ref.id} style={styles.refItem}>
                <div style={{ fontWeight: 600, color: "#e4e4e7", fontSize: "9.5px" }}>{ref.name}</div>
                <div style={{ color: "#a1a1aa", fontSize: "9px" }}>{ref.role}</div>
                {ref.company && <div style={{ color: "#a1a1aa", fontSize: "9px" }}>{ref.company}</div>}
                {ref.email && <div style={{ color: "#71717a", fontSize: "9px", marginTop: "1px" }}>{ref.email}</div>}
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
                  <div style={styles.awardDesc}>{award.description}</div>
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
