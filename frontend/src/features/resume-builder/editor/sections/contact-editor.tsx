"use client"

import { useState, useCallback, useRef } from "react"
import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { suggestJobTitleApi } from "@/lib/api/ai-suggest"

type ContactEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024

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
  const [photoError, setPhotoError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setPhotoError("")

      if (!file.type.startsWith("image/")) {
        setPhotoError("Please upload an image file")
        return
      }

      if (file.size > MAX_PHOTO_SIZE) {
        setPhotoError("Image must be under 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const maxSize = 400
          let w = img.width
          let h = img.height
          if (w > maxSize || h > maxSize) {
            if (w > h) {
              h = Math.round((h * maxSize) / w)
              w = maxSize
            } else {
              w = Math.round((w * maxSize) / h)
              h = maxSize
            }
          }
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h)
            const resized = canvas.toDataURL("image/jpeg", 0.85)
            updateContact({ photoUrl: resized })
          }
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [updateContact]
  )

  const handleRemovePhoto = useCallback(() => {
    updateContact({ photoUrl: "" })
  }, [updateContact])

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

      <FieldGroup label="Profile Photo">
        <div className="flex items-center gap-3">
          {contact.photoUrl ? (
            <div className="flex items-center gap-3">
              <img
                src={contact.photoUrl}
                alt="Profile preview"
                className="size-12 rounded-full object-cover border border-border"
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                >
                  Remove photo
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-md px-3 py-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload photo
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
        {photoError && (
          <p className="text-xs text-destructive mt-1">{photoError}</p>
        )}
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
