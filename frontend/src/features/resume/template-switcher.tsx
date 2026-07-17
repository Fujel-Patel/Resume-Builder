"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Layout, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ResumeData, ResumeTemplate } from "./types"
import { ResumePreview } from "./resume-preview"

type TemplatePickerProps = {
  active: ResumeTemplate
  onChange: (t: ResumeTemplate) => void
}

const SAMPLE_DATA: ResumeData = {
  personal: {
    name: "John Doe",
    title: "Full Stack Developer",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
  },
  links: { linkedin: "johndoe", github: "johndoe", portfolio: "", website: "" },
  summary: "Experienced developer with 5+ years building web applications using React, Node.js, and Python.",
  skills: ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
  skillGroups: null,
  experience: [
    {
      company: "Tech Corp",
      role: "Senior Developer",
      startDate: "2022",
      endDate: "Present",
      description: "Led frontend architecture and mentored junior engineers.",
    },
    {
      company: "Startup Inc",
      role: "Developer",
      startDate: "2020",
      endDate: "2022",
      description: "Built full-stack features for SaaS platform.",
    },
  ],
  education: [
    {
      school: "University of Technology",
      degree: "B.S.",
      field: "Computer Science",
      startDate: "2016",
      endDate: "2020",
    },
  ],
  projects: [
    { name: "OpenCV Project", description: "Open source CV parsing library with 2K+ stars." },
  ],
  certifications: [],
  customSections: [],
}

const templates: { id: ResumeTemplate; label: string; description: string; tag?: string }[] = [
  { id: "classic", label: "Classic", description: "Traditional serif layout with centered header" },
  { id: "modern", label: "Modern", description: "Dark navy header with skill tags" },
  { id: "minimal", label: "Minimal", description: "Clean lightweight design with muted tones" },
  { id: "creative", label: "Creative", description: "Two-column layout with dark sidebar" },
  { id: "professional-executive", label: "Professional Executive", description: "Corporate navy design with structured sections", tag: "New" },
]

export function TemplatePicker({ active, onChange }: TemplatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="brand" size="sm" onClick={() => setOpen(true)}>
        <Layout className="size-3.5" />
        Change Templates
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[calc(100vw-3rem)] sm:max-h-[calc(100vh-3rem)] p-0 gap-0 [&>[data-slot=dialog-close]]:hidden">
          <div className="flex h-full flex-col">
            <div className="border-b px-8 py-5">
              <DialogTitle className="text-xl">Choose a Template</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Select a layout style for your resume preview
              </DialogDescription>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8 overflow-y-auto">
              {templates.map((t) => {
                const selected = active === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onChange(t.id)
                      setOpen(false)
                    }}
                    className={cn(
                      "relative flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                      selected
                        ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                        : "border-border hover:border-foreground/20 hover:bg-muted/30 hover:shadow-md"
                    )}
                  >
                    {selected && (
                      <div className="absolute -top-2.5 -right-2.5 z-10 flex size-6 items-center justify-center rounded-full bg-brand text-white shadow">
                        <Check className="size-3.5" />
                      </div>
                    )}

                    {t.tag && !selected && (
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                        <Sparkles className="size-3" />
                        {t.tag}
                      </div>
                    )}

                    <div className="overflow-hidden rounded-xl border bg-white shadow-sm" style={{ height: 400 }}>
                      <div style={{ width: 800, transform: "scale(0.35)", transformOrigin: "top left" }}>
                        <ResumePreview data={SAMPLE_DATA} template={t.id} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
