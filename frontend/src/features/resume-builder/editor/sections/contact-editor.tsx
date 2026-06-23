"use client"

import { useState, useCallback } from "react"
import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { suggestJobTitleApi } from "@/lib/api/ai-suggest"

type ContactEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function ContactEditor({
  sectionId: _sectionId,
  visible,
  onToggleVisibility,
  dragHandleProps,
}: ContactEditorProps) {
  const contact = useResumeStore((s) => s.resume.content.contact)
  const jobDescription = useResumeStore((s) => s.resume.content.jobDescription)
  const updateContact = useResumeStore((s) => s.updateContact)
  const [aiLoading, setAiLoading] = useState(false)

  const handleSuggestJobTitle = useCallback(async () => {
    if (!jobDescription.trim()) return
    setAiLoading(true)
    try {
      const result = await suggestJobTitleApi({
        job_description: jobDescription,
        current_title: contact.title || null,
      })
      updateContact({ title: result.title })
    } catch {
    } finally {
      setAiLoading(false)
    }
  }, [jobDescription, contact.title, updateContact])

  return (
    <SectionHeader
      title="Contact Information"
      visible={visible}
      onToggleVisibility={onToggleVisibility}
      dragHandleProps={dragHandleProps}
      defaultOpen
      onAISuggest={handleSuggestJobTitle}
      aiLoading={aiLoading}
    >
      <FieldRow>
        <FieldGroup label="Full Name" required>
          <input
            value={contact.fullName}
            onChange={(e) => updateContact({ fullName: e.target.value })}
            placeholder="Jane Doe"
            className="field-input"
          />
        </FieldGroup>
        <FieldGroup label="Job Title" required>
          <input
            value={contact.title}
            onChange={(e) => updateContact({ title: e.target.value })}
            placeholder="Marketing Manager"
            className="field-input"
          />
        </FieldGroup>
      </FieldRow>

      <FieldRow>
        <FieldGroup label="Email" required>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => updateContact({ email: e.target.value })}
            placeholder="hello@example.com"
            className="field-input"
          />
        </FieldGroup>
        <FieldGroup label="Phone">
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => updateContact({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="field-input"
          />
        </FieldGroup>
      </FieldRow>

      <FieldGroup label="Location">
        <input
          value={contact.location}
          onChange={(e) => updateContact({ location: e.target.value })}
          placeholder="San Francisco, CA"
          className="field-input"
        />
      </FieldGroup>

      <FieldRow>
        <FieldGroup label="Website">
          <input
            type="url"
            value={contact.website}
            onChange={(e) => updateContact({ website: e.target.value })}
            placeholder="https://yoursite.com"
            className="field-input"
          />
        </FieldGroup>
        <FieldGroup label="LinkedIn">
          <input
            type="url"
            value={contact.linkedin}
            onChange={(e) => updateContact({ linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/username"
            className="field-input"
          />
        </FieldGroup>
      </FieldRow>

      <FieldGroup label="GitHub">
        <input
          type="url"
          value={contact.github}
          onChange={(e) => updateContact({ github: e.target.value })}
          placeholder="https://github.com/username"
          className="field-input"
        />
      </FieldGroup>
    </SectionHeader>
  )
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}
