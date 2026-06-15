"use client"

import { useState, useCallback } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { EditorPanel } from "@/features/resume/editor-panel"
import { PreviewPanel } from "@/features/resume/preview-panel"
import { Button } from "@/components/ui/button"
import { Save, Download, Eye, PenLine } from "lucide-react"
import type { ResumeData } from "@/features/resume/types"

const defaultResume: ResumeData = {
  personal: { name: "John Doe", title: "Senior Product Designer", email: "john@example.com", phone: "+1 (555) 123-4567", location: "San Francisco, CA" },
  links: { linkedin: "johndoe", github: "johndoe", portfolio: "johndoe.design", website: "" },
  summary: "Senior Product Designer with 8+ years of experience crafting user-centered digital products. Passionate about design systems, accessibility, and bridging the gap between business goals and user needs.",
  skills: ["Product Design", "Figma", "Design Systems", "Prototyping", "User Research", "HTML/CSS"],
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
}

export function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(defaultResume)
  const [template, setTemplate] = useState<"classic" | "modern" | "minimal">("classic")
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor")

  const handleChange = useCallback((next: ResumeData) => setData(next), [])

  return (
    <DashboardShell title="Resume Builder">
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <div className="flex items-center justify-between border-b bg-card px-4 py-2.5 lg:px-6">
          <h2 className="text-sm font-semibold text-foreground">Resume Builder</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Save className="size-3.5" /> Save</Button>
            <Button variant="brand" size="sm"><Download className="size-3.5" /> Download</Button>
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
              <EditorPanel data={data} onChange={handleChange} />
            </div>
          </div>
          <div className={`w-full lg:w-[55%] overflow-hidden ${mobileTab === "editor" ? "hidden lg:block" : ""}`}>
            <PreviewPanel data={data} template={template} onTemplateChange={setTemplate} />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
