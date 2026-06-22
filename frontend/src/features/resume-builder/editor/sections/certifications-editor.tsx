"use client"

import { useResumeStore } from "@/store/resume-store"
import { SectionHeader } from "./section-header"
import { Plus, Trash2 } from "lucide-react"

type CertificationsEditorProps = {
  sectionId: string
  visible: boolean
  onToggleVisibility: () => void
  dragHandleProps?: Record<string, unknown>
}

export function CertificationsEditor({
  sectionId,
  visible,
  onToggleVisibility,
  dragHandleProps,
}: CertificationsEditorProps) {
  const certifications = useResumeStore((s) => s.resume.content.certifications)
  const addCertification = useResumeStore((s) => s.addCertification)
  const updateCertification = useResumeStore((s) => s.updateCertification)
  const removeCertification = useResumeStore((s) => s.removeCertification)

  return (
    <SectionHeader
      title={`Certifications (${certifications.length})`}
      visible={visible}
      onToggleVisibility={onToggleVisibility}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-2">
        {certifications.map((cert) => (
          <div key={cert.id} className="rounded-lg border bg-background p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <input
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                  placeholder="Certification name"
                  className="field-input text-xs w-full"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={cert.issuer}
                    onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                    placeholder="Issuing organization"
                    className="field-input text-xs"
                  />
                  <input
                    value={cert.date}
                    onChange={(e) => updateCertification(cert.id, { date: e.target.value })}
                    placeholder="Date (e.g. 2023)"
                    className="field-input text-xs"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeCertification(cert.id)}
                className="p-1 ml-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addCertification}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
        >
          <Plus className="size-3.5" /> Add Certification
        </button>
      </div>
    </SectionHeader>
  )
}
