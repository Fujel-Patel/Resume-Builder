"use client"

import { useState, useEffect, useRef } from "react"
import { FileText } from "lucide-react"
import type { ResumeData, ResumeTemplate } from "./types"

type ResumePreviewProps = {
  data: ResumeData
  template: ResumeTemplate
  previewHtml?: string | null
}

export function ResumePreview({ data, template, previewHtml }: ResumePreviewProps) {
  switch (template) {
    case "modern":
      return <ModernTemplate data={data} />
    case "minimal":
      return <MinimalTemplate data={data} />
    case "creative":
      return <CreativeTemplate data={data} />
    case "default":
      return <DefaultTemplate data={data} previewHtml={previewHtml} />
    default:
      return <ClassicTemplate data={data} />
  }
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-b border-gray-300 pb-0.5 mb-1.5 ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">{children}</span>
    </div>
  )
}

function SkillsGrouped({ skillGroups, className = "" }: { skillGroups: Record<string, string[]>; className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {Object.entries(skillGroups).map(([group, skills]) => (
        <div key={group} className="text-[11px] leading-relaxed">
          <span className="font-bold text-gray-800">{group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: </span>
          <span className="text-gray-600">{skills.join(", ")}</span>
        </div>
      ))}
    </div>
  )
}

function SkillsFlat({ skills }: { skills: string[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <span key={s} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-700">{s}</span>
      ))}
    </div>
  )
}

function ExperienceBlock({ experience }: { experience: ResumeData["experience"] }) {
  return (
    <>
      {experience.map((exp, i) => (
        <div key={i} className={i > 0 ? "mt-2" : ""}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-gray-900">{exp.role}</p>
              <p className="text-[11px] text-gray-600">{exp.company}</p>
            </div>
            {exp.startDate && (
              <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{exp.startDate} – {exp.endDate || "Present"}</p>
            )}
          </div>
          {exp.description && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-700">{exp.description}</p>}
        </div>
      ))}
    </>
  )
}

function ProjectsBlock({ projects }: { projects: ResumeData["projects"] }) {
  return (
    <>
      {projects.map((proj, i) => (
        <div key={i} className="mt-2">
          <p className="text-[12px] font-semibold text-gray-900">{proj.name}</p>
          {proj.description && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-700">{proj.description}</p>}
        </div>
      ))}
    </>
  )
}

function EducationBlock({ education }: { education: ResumeData["education"] }) {
  return (
    <>
      {education.map((edu, i) => (
        <div key={i} className="mt-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-gray-900">{edu.degree || edu.field}</p>
              <p className="text-[11px] text-gray-600">{edu.school}</p>
            </div>
            {edu.startDate && (
              <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{edu.startDate} – {edu.endDate || "Present"}</p>
            )}
          </div>
        </div>
      ))}
    </>
  )
}

function CertificationsBlock({ certifications }: { certifications: ResumeData["certifications"] }) {
  return (
    <>
      {certifications.map((cert, i) => (
        <div key={i} className="mt-1 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-gray-900">{cert.name}</p>
            <p className="text-[10px] text-gray-500">{cert.issuer}</p>
          </div>
          {cert.date && <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{cert.date}</p>}
        </div>
      ))}
    </>
  )
}

function CustomSectionsBlock({ sections, labelComponent }: { sections: NonNullable<ResumeData["customSections"]>; labelComponent?: (label: string) => React.ReactNode }) {
  return (
    <>
      {sections.map((s, i) => (
        <div key={i} className={i > 0 ? "mt-4" : ""}>
          {labelComponent ? labelComponent(s.label) : (
            <div className="border-b border-gray-300 pb-0.5 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">{s.label}</span>
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-gray-700 whitespace-pre-line">{s.content}</p>
        </div>
      ))}
    </>
  )
}

function SkillsSection({ data }: { data: ResumeData }) {
  if (data.skillGroups && Object.keys(data.skillGroups).length > 0) {
    return <SkillsGrouped skillGroups={data.skillGroups} />
  }
  if (data.skills.length > 0) {
    return <SkillsFlat skills={data.skills} />
  }
  return null
}

// ---------------------------------------------------------------------------
// DEFAULT — renders backend-extracted style in an iframe, falls back to Classic
// ---------------------------------------------------------------------------
function DefaultTemplate({ data, previewHtml }: { data: ResumeData; previewHtml?: string | null }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!previewHtml || !iframeRef.current) return
    setLoaded(false)
    setError(false)
    const iframe = iframeRef.current
    const timer = setTimeout(() => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (doc) {
          doc.open()
          doc.write(previewHtml)
          doc.close()
          setLoaded(true)
        }
      } catch {
        setError(true)
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [previewHtml])

  if (previewHtml && !error) {
    return (
      <div className="w-full bg-white text-black" style={{ minHeight: 600 }}>
        {!loaded && (
          <div className="flex items-center justify-center p-12 text-gray-400">
            <p className="text-xs">Loading preview...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="Resume preview"
          className="w-full border-0"
          style={{
            minHeight: 600,
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s",
          }}
          sandbox="allow-same-origin"
        />
      </div>
    )
  }

  return (
    <div className="w-full bg-white text-black" style={{ minHeight: 600 }}>
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
        <FileText className="size-12 mb-3 opacity-30" />
        <p className="text-sm font-medium text-gray-500">Original Format Preserved</p>
        <p className="mt-1 text-xs text-gray-400 max-w-xs">
          Your uploaded document&apos;s original layout, fonts, and styling will be
          preserved in the exported file.
        </p>
        <div className="mt-6 w-full border-t pt-6">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Preview (classic fallback)</p>
          <ClassicTemplate data={data} />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CLASSIC
// ---------------------------------------------------------------------------
function ClassicTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="w-full bg-white text-black" style={{ fontFamily: "'Times New Roman', Times, serif", minHeight: 600 }}>
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{data.personal.name || "Your Name"}</h1>
          <p className="text-sm text-gray-600 mt-0.5">{data.personal.title || "Job Title"}</p>
          <div className="mt-1.5 flex items-center justify-center gap-3 text-[11px] text-gray-500">
            {data.personal.email && <span>{data.personal.email}</span>}
            {data.personal.phone && <span>{data.personal.phone}</span>}
            {data.personal.location && <span>{data.personal.location}</span>}
          </div>
        </div>

        {(data.links.linkedin || data.links.github) && (
          <div className="mt-2 flex justify-center gap-4 text-[11px] text-gray-500">
            {data.links.linkedin && <span>linkedin.com/in/{data.links.linkedin}</span>}
            {data.links.github && <span>github.com/{data.links.github}</span>}
          </div>
        )}

        {data.summary && (
          <div className="mt-5">
            <div className="border-b border-gray-300 mb-1.5" />
            <p className="text-[11px] leading-relaxed text-gray-700">{data.summary}</p>
          </div>
        )}

        {(data.skills.length > 0 || (data.skillGroups && Object.keys(data.skillGroups).length > 0)) && (
          <div className="mt-4">
            <SectionTitle>Skills</SectionTitle>
            <SkillsSection data={data} />
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Experience</SectionTitle>
            <ExperienceBlock experience={data.experience} />
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Projects</SectionTitle>
            <ProjectsBlock projects={data.projects} />
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Education</SectionTitle>
            <EducationBlock education={data.education} />
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Certifications</SectionTitle>
            <CertificationsBlock certifications={data.certifications} />
          </div>
        )}

        {data.customSections && data.customSections.length > 0 && (
          <CustomSectionsBlock sections={data.customSections} />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MODERN
// ---------------------------------------------------------------------------
function ModernTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="w-full bg-white text-black" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: 600 }}>
      <div className="bg-[#1a3a5c] px-8 pt-8 pb-6 text-white">
        <h1 className="text-2xl font-light tracking-wider">{data.personal.name || "Your Name"}</h1>
        <p className="text-sm font-light opacity-85 mt-1">{data.personal.title || "Job Title"}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] opacity-80">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.location && <span>{data.personal.location}</span>}
          {data.links.linkedin && <span>linkedin.com/in/{data.links.linkedin}</span>}
          {data.links.github && <span>github.com/{data.links.github}</span>}
        </div>
      </div>

      <div className="p-8 pt-6">
        {data.summary && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a3a5c] border-b border-[#1a3a5c] pb-1 mb-2">Professional Summary</h2>
            <p className="text-[11px] leading-relaxed text-gray-700">{data.summary}</p>
          </div>
        )}

        {(data.skills.length > 0 || (data.skillGroups && Object.keys(data.skillGroups).length > 0)) && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a3a5c] border-b border-[#1a3a5c] pb-1 mb-2">Skills</h2>
            {data.skillGroups && Object.keys(data.skillGroups).length > 0 ? (
              Object.entries(data.skillGroups).map(([group, skills]) => (
                <div key={group} className="flex flex-wrap gap-1 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#1a3a5c] min-w-[70px]">{group.replace(/_/g, " ")}:</span>
                  {skills.map((s) => (
                    <span key={s} className="bg-[#e8eef4] text-[#1a3a5c] px-2 py-0.5 rounded text-[10px]">{s}</span>
                  ))}
                </div>
              ))
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s) => (
                  <span key={s} className="bg-[#e8eef4] text-[#1a3a5c] px-2 py-0.5 rounded text-[10px]">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a3a5c] border-b border-[#1a3a5c] pb-1 mb-2">Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className={i > 0 ? "mt-3" : ""}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-[#1a3a5c]">{exp.company}</p>
                    <p className="text-[11px] italic text-gray-600">{exp.role}</p>
                  </div>
                  {exp.startDate && (
                    <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{exp.startDate} – {exp.endDate || "Present"}</p>
                  )}
                </div>
                {exp.description && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-700 ml-0">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a3a5c] border-b border-[#1a3a5c] pb-1 mb-2">Projects</h2>
            {data.projects.map((proj, i) => (
              <div key={i} className={i > 0 ? "mt-2" : ""}>
                <p className="text-[12px] font-bold text-[#1a3a5c]">{proj.name}</p>
                {proj.description && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-700">{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a3a5c] border-b border-[#1a3a5c] pb-1 mb-2">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className={i > 0 ? "mt-2" : ""}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-gray-900">{edu.school}</p>
                    <p className="text-[10px] text-gray-600">{edu.degree}{edu.field ? `, ${edu.field}` : ""}</p>
                  </div>
                  {edu.startDate && (
                    <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a3a5c] border-b border-[#1a3a5c] pb-1 mb-2">Certifications</h2>
            {data.certifications.map((cert, i) => (
              <div key={i} className="flex items-start justify-between mt-1">
                <div>
                  <p className="text-[11px] font-medium text-gray-900">{cert.name}</p>
                  <p className="text-[10px] text-gray-500">{cert.issuer}</p>
                </div>
                {cert.date && <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{cert.date}</p>}
              </div>
            ))}
          </div>
        )}

        {data.customSections && data.customSections.length > 0 && (
          <CustomSectionsBlock
            sections={data.customSections}
            labelComponent={(label) => (
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a3a5c] border-b border-[#1a3a5c] pb-1 mb-2">{label}</h2>
            )}
          />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MINIMAL
// ---------------------------------------------------------------------------
function MinimalTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="w-full bg-white text-black" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: 600 }}>
      <div className="p-8">
        <h1 className="text-xl font-light text-gray-800">{data.personal.name || "Your Name"}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{data.personal.title || "Job Title"}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.location && <span>{data.personal.location}</span>}
          {data.links.linkedin && <span>linkedin.com/in/{data.links.linkedin}</span>}
          {data.links.github && <span>github.com/{data.links.github}</span>}
        </div>

        {data.summary && (
          <div className="mt-6">
            <p className="text-[11px] leading-relaxed text-gray-600">{data.summary}</p>
          </div>
        )}

        {(data.skills.length > 0 || (data.skillGroups && Object.keys(data.skillGroups).length > 0)) && (
          <div className="mt-5">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">Skills</p>
            <SkillsSection data={data} />
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mt-5">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">Experience</p>
            <ExperienceBlock experience={data.experience} />
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mt-5">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">Projects</p>
            <ProjectsBlock projects={data.projects} />
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mt-5">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">Education</p>
            <EducationBlock education={data.education} />
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="mt-5">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">Certifications</p>
            <CertificationsBlock certifications={data.certifications} />
          </div>
        )}

        {data.customSections && data.customSections.length > 0 && (
          <CustomSectionsBlock
            sections={data.customSections}
            labelComponent={(label) => (
              <p className="text-[9px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">{label}</p>
            )}
          />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CREATIVE
// ---------------------------------------------------------------------------
function CreativeTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="flex w-full bg-white text-black" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: 600 }}>
      <div className="w-[35%] bg-[#2d2d3f] p-6 text-[#d0d0e0] flex flex-col">
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">{data.personal.name || "Your Name"}</h1>
          <p className="text-[11px] text-[#a0a0c0] mt-1">{data.personal.title || "Job Title"}</p>
        </div>

        <div className="mt-6">
          <p className="text-[8px] font-bold uppercase tracking-wider text-[#c0c0e0] mb-2">Contact</p>
          <div className="space-y-1 text-[10px] text-[#d0d0e0]">
            {data.personal.email && <p>{data.personal.email}</p>}
            {data.personal.phone && <p>{data.personal.phone}</p>}
            {data.personal.location && <p>{data.personal.location}</p>}
          </div>
        </div>

        {(data.links.linkedin || data.links.github) && (
          <div className="mt-4">
            <p className="text-[8px] font-bold uppercase tracking-wider text-[#c0c0e0] mb-2">Links</p>
            <div className="space-y-1 text-[10px] text-[#a0a0c0]">
              {data.links.github && <p>github.com/{data.links.github}</p>}
              {data.links.linkedin && <p>linkedin.com/in/{data.links.linkedin}</p>}
              {data.links.portfolio && <p>{data.links.portfolio}</p>}
            </div>
          </div>
        )}

        {(data.skills.length > 0 || (data.skillGroups && Object.keys(data.skillGroups).length > 0)) && (
          <div className="mt-4">
            <p className="text-[8px] font-bold uppercase tracking-wider text-[#c0c0e0] mb-2">Skills</p>
            {data.skillGroups && Object.keys(data.skillGroups).length > 0 ? (
              Object.entries(data.skillGroups).map(([group, skills]) => (
                <div key={group} className="mb-2">
                  <p className="text-[9px] font-bold text-[#c0c0e0]">{group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                  <p className="text-[9px] text-[#d0d0e0]">{skills.join(", ")}</p>
                </div>
              ))
            ) : (
              data.skills.map((s) => (
                <p key={s} className="text-[9px] text-[#d0d0e0] mb-1">{s}</p>
              ))
            )}
          </div>
        )}
      </div>

      <div className="w-[65%] p-6">
        {data.summary && (
          <div className="mb-5">
            <h2 className="text-[11px] font-bold text-[#2d2d3f] border-b-2 border-[#2d2d3f] pb-1 mb-2 uppercase tracking-wider">Professional Summary</h2>
            <p className="text-[11px] leading-relaxed text-gray-700">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[11px] font-bold text-[#2d2d3f] border-b-2 border-[#2d2d3f] pb-1 mb-2 uppercase tracking-wider">Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className={i > 0 ? "mt-3" : ""}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-[#2d2d3f]">{exp.company}</p>
                    <p className="text-[11px] italic text-gray-600">{exp.role}</p>
                  </div>
                  {exp.startDate && (
                    <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{exp.startDate} – {exp.endDate || "Present"}</p>
                  )}
                </div>
                {exp.description && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-700">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[11px] font-bold text-[#2d2d3f] border-b-2 border-[#2d2d3f] pb-1 mb-2 uppercase tracking-wider">Projects</h2>
            {data.projects.map((proj, i) => (
              <div key={i} className={i > 0 ? "mt-2" : ""}>
                <p className="text-[12px] font-bold text-[#2d2d3f]">{proj.name}</p>
                {proj.description && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-700">{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[11px] font-bold text-[#2d2d3f] border-b-2 border-[#2d2d3f] pb-1 mb-2 uppercase tracking-wider">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className={i > 0 ? "mt-2" : ""}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-gray-900">{edu.school}</p>
                    <p className="text-[10px] text-gray-600">{edu.degree}{edu.field ? `, ${edu.field}` : ""}</p>
                  </div>
                  {edu.startDate && (
                    <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold text-[#2d2d3f] border-b-2 border-[#2d2d3f] pb-1 mb-2 uppercase tracking-wider">Certifications</h2>
            {data.certifications.map((cert, i) => (
              <div key={i} className="flex items-start justify-between mt-1">
                <div>
                  <p className="text-[11px] font-medium text-gray-900">{cert.name}</p>
                  <p className="text-[10px] text-gray-500">{cert.issuer}</p>
                </div>
                {cert.date && <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{cert.date}</p>}
              </div>
            ))}
          </div>
        )}

        {data.customSections && data.customSections.length > 0 && (
          <CustomSectionsBlock
            sections={data.customSections}
            labelComponent={(label) => (
              <h2 className="text-[11px] font-bold text-[#2d2d3f] border-b-2 border-[#2d2d3f] pb-1 mb-2 uppercase tracking-wider">{label}</h2>
            )}
          />
        )}
      </div>
    </div>
  )
}
