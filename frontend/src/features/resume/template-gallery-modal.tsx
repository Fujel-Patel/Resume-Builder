"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Layout, Sparkles, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ResumeData, ResumeTemplate } from "./types"
import { ProfessionalExecutivePreview } from "./templates/professional-executive/preview"
import { ObsidianEdgeTemplate } from "../resume-builder/preview/templates/obsidian-edge"
import { BlueSteelTemplate } from "../resume-builder/preview/templates/blue-steel"
import { NeonGreenTemplate } from "../resume-builder/preview/templates/neon-green"
import { sampleResumeData } from "./template-previews/sampleResumeData"

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

type GalleryTemplate = {
  id: ResumeTemplate
  label: string
  description: string
  tag?: string
}

const galleryTemplates: GalleryTemplate[] = [
  { id: "classic", label: "Classic", description: "Traditional serif layout with centered header" },
  { id: "modern", label: "Modern", description: "Dark navy header with skill tags" },
  { id: "minimal", label: "Minimal", description: "Clean lightweight design with muted tones" },
  { id: "creative", label: "Creative", description: "Two-column layout with dark sidebar" },
  { id: "professional-executive", label: "Professional Executive", description: "Corporate navy design with structured sections", tag: "New" },
  { id: "obsidian-edge", label: "Obsidian Edge", description: "Bold black header with white body and multi-column skills", tag: "New" },
  { id: "blue-steel", label: "Blue Steel", description: "Minimalist European design with elegant typography", tag: "New" },
  { id: "neon-green", label: "Neon Green", description: "Modern software-engineer resume with clean typography and green accents", tag: "New" },
]

function TemplatePreviewCard({ template }: { template: GalleryTemplate }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-white shadow-sm")} style={{ height: 280 }}>
      {template.id === "professional-executive" ? (
        <div style={{ width: 794, transform: "scale(0.18)", transformOrigin: "top left" }}>
          <ProfessionalExecutivePreview data={SAMPLE_DATA} />
        </div>
      ) : template.id === "obsidian-edge" ? (
        <div style={{ width: 794, transform: "scale(0.18)", transformOrigin: "top left" }}>
          <div className="bg-white">
            <ObsidianEdgeTemplate resume={sampleResumeData} />
          </div>
        </div>
      ) : template.id === "blue-steel" ? (
        <div style={{ width: 794, transform: "scale(0.18)", transformOrigin: "top left" }}>
          <div className="bg-white">
            <BlueSteelTemplate resume={sampleResumeData} />
          </div>
        </div>
      ) : template.id === "neon-green" ? (
        <div style={{ width: 794, transform: "scale(0.18)", transformOrigin: "top left" }}>
          <div className="bg-white">
            <NeonGreenTemplate resume={sampleResumeData} />
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Layout className="size-8 opacity-30" />
            <span>Preview coming soon</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function TemplateGalleryModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="brand" size="sm" onClick={() => setOpen(true)}>
        <Layout className="size-3.5" />
        Gallery
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[calc(100vw-3rem)] p-0 gap-0" showCloseButton={false}>
          <div className="flex items-center justify-between border-b px-8 py-5">
            <div>
              <DialogTitle className="text-xl">Template Gallery</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Browse and preview resume templates
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
            {galleryTemplates.map((t) => (
              <div
                key={t.id}
                className="group relative flex flex-col gap-3 rounded-2xl border-2 border-border p-4 text-left transition-all hover:border-foreground/20 hover:bg-muted/30 hover:shadow-md"
              >
                {t.tag && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                    <Sparkles className="size-3" />
                    {t.tag}
                  </div>
                )}

                <TemplatePreviewCard template={t} />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  </div>
                  <Button
                    variant="brandOutline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Use
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
