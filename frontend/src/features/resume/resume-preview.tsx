"use client"

import { cn } from "@/lib/utils"
import type { ResumeData } from "./types"

type ResumePreviewProps = {
  data: ResumeData
  template: "classic" | "modern" | "minimal"
}

export function ResumePreview({ data, template }: ResumePreviewProps) {
  return (
    <div className="w-full rounded-card bg-white text-black shadow-xl ring-1 ring-black/5 overflow-hidden" style={{ minHeight: 600 }}>
      <div className={cn("p-8", template === "classic" && "", template === "modern" && "", template === "minimal" && "")}>
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
          <div className="mt-3 flex justify-center gap-4 text-[11px] text-gray-500">
            {data.links.linkedin && <span>linkedin.com/in/{data.links.linkedin}</span>}
            {data.links.github && <span>github.com/{data.links.github}</span>}
          </div>
        )}

        {data.summary && (
          <div className="mt-4">
            <SectionTitle>Professional Summary</SectionTitle>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-700">{data.summary}</p>
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Skills</SectionTitle>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {data.skills.map((s) => (
                <span key={s} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-700">{s}</span>
              ))}
            </div>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Experience</SectionTitle>
            {data.experience.map((exp, i) => (
              <div key={i} className={cn("mt-2", i > 0 && "mt-2")}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900">{exp.role}</p>
                    <p className="text-[11px] text-gray-600">{exp.company}</p>
                  </div>
                  {exp.startDate && (
                    <p className="text-[10px] text-gray-500">{exp.startDate} – {exp.endDate || "Present"}</p>
                  )}
                </div>
                {exp.description && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-700">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Projects</SectionTitle>
            {data.projects.map((proj, i) => (
              <div key={i} className="mt-2">
                <p className="text-[12px] font-semibold text-gray-900">{proj.name}</p>
                {proj.description && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-700">{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Education</SectionTitle>
            {data.education.map((edu, i) => (
              <div key={i} className="mt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900">{edu.degree}</p>
                    <p className="text-[11px] text-gray-600">{edu.school}</p>
                  </div>
                  {edu.startDate && (
                    <p className="text-[10px] text-gray-500">{edu.startDate} – {edu.endDate || "Present"}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="mt-4">
            <SectionTitle>Certifications</SectionTitle>
            {data.certifications.map((cert, i) => (
              <div key={i} className="mt-1 flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-gray-900">{cert.name}</p>
                  <p className="text-[10px] text-gray-500">{cert.issuer}</p>
                </div>
                {cert.date && <p className="text-[10px] text-gray-500">{cert.date}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 pb-0.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">{children}</span>
    </div>
  )
}
