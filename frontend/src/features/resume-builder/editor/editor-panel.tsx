"use client"

import { useResumeStore } from "@/store/resume-store"
import { ContactEditor } from "./sections/contact-editor"
import { DndSectionList } from "./dnd-section-list"
import { SectionHeader } from "./sections/section-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import { useState } from "react"

export function EditorPanel() {
  const jobDescription = useResumeStore((s) => s.resume.content.jobDescription)
  const setJobDescription = useResumeStore((s) => s.setJobDescription)
  const addCustomSectionType = useResumeStore((s) => s.addCustomSectionType)
  const toggleSectionVisibility = useResumeStore((s) => s.toggleSectionVisibility)
  const [customTitle, setCustomTitle] = useState("")

  const handleAddCustom = () => {
    if (customTitle.trim()) {
      addCustomSectionType(customTitle.trim())
      setCustomTitle("")
    }
  }

  return (
    <div className="space-y-3">
      {/* Job Description */}
      <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
          <FileText className="size-4" />
          Job Description
        </div>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here to help AI tailor your resume..."
          className="field-input text-xs min-h-[200px] resize-y"
          rows={8}
        />
      </div>

      {/* Contact (always first, no DnD) */}
      <ContactEditor
        sectionId="contact"
        visible={true}
        onToggleVisibility={() => {}}
      />

      {/* Sortable sections */}
      <DndSectionList />

      {/* Add Custom Section */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Add Custom Section</p>
        <div className="flex gap-2">
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
            placeholder="Section title (e.g. Publications, Volunteer)"
            className="field-input text-xs flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustom}
            disabled={!customTitle.trim()}
          >
            <Plus className="size-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  )
}
