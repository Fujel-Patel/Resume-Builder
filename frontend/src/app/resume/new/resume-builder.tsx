"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { BuilderLayout } from "@/features/resume-builder/builder-layout"
import { useResumeStore } from "@/store/resume-store"
import { getResumeApi, toFrontendResumeData } from "@/lib/api/resumes"
import type { ResumeData as LegacyResumeData } from "@/features/resume/types"

export function ResumeBuilder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setResume = useResumeStore((s) => s.setResume)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      getResumeApi(id)
        .then((r) => {
          const saved = toFrontendResumeData(r)
          setResume(mapLegacyToNew(saved, r.id))
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [searchParams, setResume])

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
      <BuilderLayout />
    </DashboardShell>
  )
}

function mapLegacyToNew(legacy: LegacyResumeData, id: string) {
  const store = useResumeStore.getState()
  const resume = store.resume

  return {
    ...resume,
    id,
    name: `${legacy.personal.name}'s Resume`,
    content: {
      ...resume.content,
      contact: {
        fullName: legacy.personal.name,
        title: legacy.personal.title,
        email: legacy.personal.email,
        phone: legacy.personal.phone,
        location: legacy.personal.location,
        website: legacy.links.portfolio || legacy.links.website,
        linkedin: legacy.links.linkedin ? `https://linkedin.com/in/${legacy.links.linkedin}` : "",
        github: legacy.links.github ? `https://github.com/${legacy.links.github}` : "",
        photoUrl: "",
      },
      summary: legacy.summary,
      jobDescription: legacy.jobDescription || "",
      experience: legacy.experience.map((e) => ({
        id: `exp_${Math.random().toString(36).slice(2)}`,
        company: e.company,
        role: e.role,
        startDate: e.startDate,
        endDate: e.endDate,
        current: e.endDate?.toLowerCase() === "present",
        location: "",
        bullets: e.description ? e.description.split("\n").filter(Boolean) : [],
      })),
      education: legacy.education.map((e) => ({
        id: `edu_${Math.random().toString(36).slice(2)}`,
        institution: e.school,
        degree: e.degree,
        field: e.field,
        startDate: e.startDate,
        endDate: e.endDate,
        current: false,
        gpa: "",
      })),
      skills: legacy.skillGroups
        ? Object.entries(legacy.skillGroups).map(([name, skills]) => ({
            id: `skg_${Math.random().toString(36).slice(2)}`,
            name,
            skills,
          }))
        : legacy.skills.length > 0
          ? [{ id: "skg_default", name: "", skills: legacy.skills }]
          : [],
      certifications: legacy.certifications.map((c) => ({
        id: `cert_${Math.random().toString(36).slice(2)}`,
        name: c.name,
        issuer: c.issuer,
        date: c.date,
        url: "",
      })),
      projects: legacy.projects.map((p) => ({
        id: `proj_${Math.random().toString(36).slice(2)}`,
        name: p.name,
        role: "",
        url: "",
        startDate: "",
        endDate: "",
        bullets: p.description ? [p.description] : [],
      })),
    },
    updatedAt: new Date().toISOString(),
  }
}
