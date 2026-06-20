"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { EditorPanel } from "@/features/resume/editor-panel"
import { PreviewPanel } from "@/features/resume/preview-panel"
import { TemplatePicker } from "@/features/resume/template-switcher"
import { Button } from "@/components/ui/button"
import { Download, Eye, PenLine, ArrowLeft } from "lucide-react"
import { saveSection, getResumeApi, toFrontendResumeData, exportResume } from "@/lib/api/resumes"
import type { ResumeData, ResumeTemplate } from "@/features/resume/types"

const defaultResume: ResumeData = {
  personal: { name: "John Doe", title: "Senior Product Designer", email: "john@example.com", phone: "+1 (555) 123-4567", location: "San Francisco, CA" },
  links: { linkedin: "johndoe", github: "johndoe", portfolio: "johndoe.design", website: "" },
  summary: "Senior Product Designer with 8+ years of experience crafting user-centered digital products. Passionate about design systems, accessibility, and bridging the gap between business goals and user needs.",
  skills: ["Product Design", "Figma", "Design Systems", "Prototyping", "User Research", "HTML/CSS"],
  skillGroups: null,
  experience: [
    { company: "Linear", role: "Senior Product Designer", startDate: "2022", endDate: "Present", description: "Lead designer for the core product experience. Redesigned the project management interface, resulting in a 25% increase in user engagement. Established the company design system." },
    { company: "Stripe", role: "Product Designer", startDate: "2019", endDate: "2022", description: "Designed payment workflows serving millions of users. Collaborated with engineering to ship 15+ major features. Improved checkout conversion by 12%." },
  ],
  education: [
    { school: "Stanford University", degree: "B.S.", field: "Computer Science", startDate: "2015", endDate: "2019" },
  ],
  projects: [
    { name: "Design System Kit", description: "Open-source Figma plugin for design token management. 2k+ stars on GitHub." },
  ],
  certifications: [
    { name: "UX Design Professional Certificate", issuer: "Google", date: "2021" },
  ],
  customSections: [],
}

export function ResumeBuilder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<ResumeData>(defaultResume)
  const [template, setTemplate] = useState<ResumeTemplate>("classic")
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor")
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const resumeIdRef = useRef<string | null>(null)

  useEffect(() => {
    resumeIdRef.current = resumeId
  }, [resumeId])

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      getResumeApi(id)
        .then((r) => {
          const saved = toFrontendResumeData(r)
          setData({
            personal: {
              name: saved.personal.name || defaultResume.personal.name,
              title: saved.personal.title || defaultResume.personal.title,
              email: saved.personal.email || defaultResume.personal.email,
              phone: saved.personal.phone || defaultResume.personal.phone,
              location: saved.personal.location || defaultResume.personal.location,
            },
            links: {
              linkedin: saved.links.linkedin || defaultResume.links.linkedin,
              github: saved.links.github || defaultResume.links.github,
              portfolio: saved.links.portfolio || defaultResume.links.portfolio,
              website: saved.links.website || defaultResume.links.website,
            },
            summary: saved.summary || defaultResume.summary,
            skills: saved.skills.length > 0 ? saved.skills : defaultResume.skills,
            skillGroups: saved.skillGroups ?? defaultResume.skillGroups,
            experience: saved.experience.length > 0 ? saved.experience : defaultResume.experience,
            education: saved.education.length > 0 ? saved.education : defaultResume.education,
            projects: saved.projects.length > 0 ? saved.projects : defaultResume.projects,
            certifications: saved.certifications.length > 0 ? saved.certifications : defaultResume.certifications,
            customSections: saved.customSections.length > 0 ? saved.customSections : defaultResume.customSections,
          })
          setResumeId(r.id)
        })
        .catch(() => {
          // resume not found — start fresh
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const handleChange = useCallback((next: ResumeData) => setData(next), [])

  const handleSaveSection = useCallback(async (section: keyof ResumeData) => {
    setSaving(section)
    try {
      const currentId = resumeIdRef.current
      const id = await saveSection(currentId, data, section)
      if (!currentId) {
        setResumeId(id)
        router.replace(`/resume/new?id=${id}`, { scroll: false })
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setSaving(null)
    }
  }, [data, router])

  const handleDownload = useCallback(async () => {
    let id = resumeIdRef.current
    if (!id) {
      try {
        id = await saveSection(null, data, "personal")
        if (id) {
          setResumeId(id)
          router.replace(`/resume/new?id=${id}`, { scroll: false })
        }
      } catch {
        return
      }
    }
    if (id) {
      try {
        await exportResume(id)
      } catch {
        // download failed
      }
    }
  }, [data, router])

  if (loading) {
    return (
      <DashboardShell title="Resume Builder">
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell title="Resume Builder">
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <div className="flex items-center justify-between border-b bg-card px-4 py-2.5 lg:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-xs" onClick={() => router.back()} aria-label="Go back">
              <ArrowLeft className="size-4" />
            </Button>
            <h2 className="text-sm font-semibold text-foreground">Resume Builder</h2>
          </div>
          <div className="flex items-center gap-2">
            <TemplatePicker active={template} onChange={setTemplate} />
            <Button variant="brand" size="sm" onClick={handleDownload}>
              <Download className="size-3.5" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="flex lg:hidden border-b bg-card">
          <button
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${mobileTab === "editor" ? "border-b-2 border-brand text-brand" : "text-muted-foreground"}`}
          ><PenLine className="inline size-3.5 mr-1" />Editor</button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${mobileTab === "preview" ? "border-b-2 border-brand text-brand" : "text-muted-foreground"}`}
          ><Eye className="inline size-3.5 mr-1" />Preview</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className={`w-full lg:w-[45%] overflow-auto border-r ${mobileTab === "preview" ? "hidden lg:block" : ""}`}>
            <div className="p-4 lg:p-6">
              <EditorPanel data={data} onChange={handleChange} onSave={handleSaveSection} saving={saving} />
            </div>
          </div>
          <div className={`w-full lg:w-[55%] overflow-hidden ${mobileTab === "editor" ? "hidden lg:block" : ""}`}>
            <PreviewPanel data={data} template={template} />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
