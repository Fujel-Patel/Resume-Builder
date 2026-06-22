"use client"

import type { ResumeData } from "@/types/resume"
import { ResumePage, ResumeSectionTitle } from "../resume-page"

type NovaTemplateProps = {
  resume: ResumeData
}

export function NovaTemplate({ resume }: NovaTemplateProps) {
  const { content, sections, theme } = resume
  const { contact, summary, experience, education, skills, languages, certifications, projects, awards, interests, references } = content

  const visibleSections = sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order)

  const sidebarSections = visibleSections.filter((s) =>
    ["contact", "skills", "languages", "interests", "references"].includes(s.type)
  )
  const mainSections = visibleSections.filter((s) =>
    !["contact", "skills", "languages", "interests", "references"].includes(s.type)
  )

  const pageStyle = {
    fontFamily: theme.fontFamily || "Inter, sans-serif",
    color: theme.textColor || "#333333",
  }

  return (
    <ResumePage className="print:shadow-none">
      <div style={pageStyle}>
        <div className="flex gap-6" style={{ minHeight: "250mm" }}>
          {/* Sidebar */}
          <aside className="w-[30%] shrink-0">
            <div className="space-y-5">
              {/* Contact / Header in Sidebar */}
              <div>
                <h1 className="text-[22px] font-bold leading-tight text-gray-900 mb-0.5">
                  {contact.fullName || "Your Name"}
                </h1>
                <p className="text-[13px] text-gray-500 mb-3">
                  {contact.title || "Job Title"}
                </p>
                <div className="space-y-1.5 text-[10px] text-gray-600">
                  {contact.email && (
                    <p className="flex items-center gap-1.5">
                      <span className="text-gray-400 shrink-0">&#9993;</span>
                      <span className="truncate">{contact.email}</span>
                    </p>
                  )}
                  {contact.phone && (
                    <p className="flex items-center gap-1.5">
                      <span className="text-gray-400 shrink-0">&#9742;</span>
                      <span>{contact.phone}</span>
                    </p>
                  )}
                  {contact.location && (
                    <p className="flex items-center gap-1.5">
                      <span className="text-gray-400 shrink-0">&#9906;</span>
                      <span>{contact.location}</span>
                    </p>
                  )}
                  {contact.website && (
                    <p className="flex items-center gap-1.5">
                      <span className="text-gray-400 shrink-0">&#128279;</span>
                      <span className="truncate">{contact.website}</span>
                    </p>
                  )}
                  {contact.linkedin && (
                    <p className="flex items-center gap-1.5">
                      <span className="text-gray-400 shrink-0">in</span>
                      <span className="truncate">{contact.linkedin}</span>
                    </p>
                  )}
                  {contact.github && (
                    <p className="flex items-center gap-1.5">
                      <span className="text-gray-400 shrink-0">&#128187;</span>
                      <span className="truncate">{contact.github}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {skills.length > 0 && sidebarSections.some((s) => s.type === "skills") && (
                <div>
                  <ResumeSectionTitle style="underline">
                    Skills
                  </ResumeSectionTitle>
                  <div className="space-y-2">
                    {skills.map((group) => (
                      <div key={group.id}>
                        {group.name && (
                          <p className="text-[10px] font-semibold text-gray-700 mb-0.5 uppercase tracking-wider">
                            {group.name}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {group.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="text-[9px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {languages.length > 0 && sidebarSections.some((s) => s.type === "languages") && (
                <div>
                  <ResumeSectionTitle style="underline">
                    Languages
                  </ResumeSectionTitle>
                  <div className="space-y-1">
                    {languages.map((lang) => (
                      <div key={lang.id} className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-700">{lang.name}</span>
                        <span className="text-gray-400 capitalize">{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {interests.length > 0 && sidebarSections.some((s) => s.type === "interests") && (
                <div>
                  <ResumeSectionTitle style="underline">
                    Interests
                  </ResumeSectionTitle>
                  <div className="flex flex-wrap gap-1">
                    {interests.map((item) => (
                      <span
                        key={item.id}
                        className="text-[10px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded-sm border border-gray-200"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {references.length > 0 && sidebarSections.some((s) => s.type === "references") && (
                <div>
                  <ResumeSectionTitle style="underline">
                    References
                  </ResumeSectionTitle>
                  <div className="space-y-2">
                    {references.map((ref) => (
                      <div key={ref.id} className="text-[10px]">
                        <p className="font-semibold text-gray-800">{ref.name}</p>
                        <p className="text-gray-500">{ref.role}</p>
                        {ref.company && <p className="text-gray-500">{ref.company}</p>}
                        {ref.email && <p className="text-gray-400">{ref.email}</p>}
                        {ref.phone && <p className="text-gray-400">{ref.phone}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content with Timeline */}
          <main className="flex-1 relative">
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />

            <div className="space-y-5 pl-5">
              {/* Summary */}
              {summary && mainSections.some((s) => s.type === "summary") && (
                <section className="relative" aria-label="Professional Summary">
                  <div className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-gray-300 border-2 border-white" />
                  <ResumeSectionTitle style="underline">
                    Professional Summary
                  </ResumeSectionTitle>
                  <p className="text-[11px] leading-relaxed text-gray-700">
                    {summary}
                  </p>
                </section>
              )}

              {/* Experience */}
              {experience.length > 0 && mainSections.some((s) => s.type === "experience") && (
                <section className="relative" aria-label="Experience">
                  <div className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-gray-300 border-2 border-white" />
                  <ResumeSectionTitle style="underline">
                    Experience
                  </ResumeSectionTitle>
                  <div className="space-y-3">
                    {experience.map((exp) => (
                      <div key={exp.id} className="relative break-inside-avoid">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-gray-900">
                              {exp.role}
                            </p>
                            <p className="text-[11px] text-gray-600">
                              {exp.company}
                              {exp.location && ` — ${exp.location}`}
                            </p>
                          </div>
                          {(exp.startDate || exp.endDate) && (
                            <p className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                              {exp.startDate}
                              {exp.startDate && exp.endDate && " – "}
                              {exp.current ? "Present" : exp.endDate}
                            </p>
                          )}
                        </div>
                        {exp.bullets.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {exp.bullets.map((bullet, i) => (
                              <li
                                key={i}
                                className="text-[11px] leading-relaxed text-gray-700 pl-3 relative before:absolute before:left-0 before:top-[5px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-gray-400"
                              >
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {education.length > 0 && mainSections.some((s) => s.type === "education") && (
                <section className="relative" aria-label="Education">
                  <div className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-gray-300 border-2 border-white" />
                  <ResumeSectionTitle style="underline">
                    Education
                  </ResumeSectionTitle>
                  <div className="space-y-2">
                    {education.map((edu) => (
                      <div key={edu.id} className="break-inside-avoid">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-gray-900">
                              {edu.degree}
                              {edu.field && ` in ${edu.field}`}
                            </p>
                            <p className="text-[11px] text-gray-600">
                              {edu.institution}
                            </p>
                            {edu.gpa && (
                              <p className="text-[10px] text-gray-400">
                                GPA: {edu.gpa}
                              </p>
                            )}
                          </div>
                          {(edu.startDate || edu.endDate) && (
                            <p className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                              {edu.startDate}
                              {edu.startDate && edu.endDate && " – "}
                              {edu.current ? "Present" : edu.endDate}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {certifications.length > 0 && mainSections.some((s) => s.type === "certifications") && (
                <section className="relative" aria-label="Certifications">
                  <div className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-gray-300 border-2 border-white" />
                  <ResumeSectionTitle style="underline">
                    Certifications
                  </ResumeSectionTitle>
                  <div className="space-y-1.5">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex items-start justify-between gap-2 text-[11px]">
                        <div>
                          <p className="font-medium text-gray-800">{cert.name}</p>
                          {cert.issuer && (
                            <p className="text-gray-500">{cert.issuer}</p>
                          )}
                        </div>
                        {cert.date && (
                          <p className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                            {cert.date}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {projects.length > 0 && mainSections.some((s) => s.type === "projects") && (
                <section className="relative" aria-label="Projects">
                  <div className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-gray-300 border-2 border-white" />
                  <ResumeSectionTitle style="underline">
                    Projects
                  </ResumeSectionTitle>
                  <div className="space-y-2">
                    {projects.map((proj) => (
                      <div key={proj.id} className="break-inside-avoid">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12px] font-semibold text-gray-900">
                            {proj.name}
                            {proj.role && ` — ${proj.role}`}
                          </p>
                          {(proj.startDate || proj.endDate) && (
                            <p className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                              {proj.startDate}
                              {proj.startDate && proj.endDate && " – "}
                              {proj.endDate}
                            </p>
                          )}
                        </div>
                        {proj.bullets.length > 0 && (
                          <ul className="mt-0.5 space-y-0.5">
                            {proj.bullets.map((bullet, i) => (
                              <li
                                key={i}
                                className="text-[11px] leading-relaxed text-gray-700 pl-3 relative before:absolute before:left-0 before:top-[5px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-gray-400"
                              >
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Awards */}
              {awards.length > 0 && mainSections.some((s) => s.type === "awards") && (
                <section className="relative" aria-label="Awards">
                  <div className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-gray-300 border-2 border-white" />
                  <ResumeSectionTitle style="underline">
                    Awards
                  </ResumeSectionTitle>
                  <div className="space-y-1.5">
                    {awards.map((award) => (
                      <div key={award.id} className="break-inside-avoid">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-medium text-gray-800">{award.name}</p>
                            {award.issuer && (
                              <p className="text-[10px] text-gray-500">{award.issuer}</p>
                            )}
                          </div>
                          {award.date && (
                            <p className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                              {award.date}
                            </p>
                          )}
                        </div>
                        {award.description && (
                          <p className="text-[10px] text-gray-600 mt-0.5">{award.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Custom Sections */}
              {content.custom.length > 0 && mainSections.some((s) => s.type === "custom") && (
                <>
                  {content.custom.map((section) => (
                    <section key={section.id} className="relative" aria-label={section.title}>
                      <div className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-gray-300 border-2 border-white" />
                      <ResumeSectionTitle style="underline">
                        {section.title}
                      </ResumeSectionTitle>
                      {section.content && (
                        <p className="text-[11px] leading-relaxed text-gray-700 whitespace-pre-line">
                          {section.content}
                        </p>
                      )}
                      {section.bullets.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {section.bullets.map((bullet, i) => (
                            <li
                              key={i}
                              className="text-[11px] leading-relaxed text-gray-700 pl-3 relative before:absolute before:left-0 before:top-[5px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-gray-400"
                            >
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </ResumePage>
  )
}
