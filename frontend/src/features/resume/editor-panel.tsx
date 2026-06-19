"use client"

import { useState, useCallback } from "react"
import { FormSection } from "@/features/resume/form-section"
import { TagInput } from "@/features/resume/tag-input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save } from "lucide-react"
import { toast } from "sonner"
import {
  suggestSummaryApi,
  suggestSkillsApi,
  suggestExperienceApi,
  suggestProjectsApi,
} from "@/lib/api/ai-suggest"
import type { ResumeData, ExperienceEntry, EducationEntry, ProjectEntry, CertificationEntry } from "@/features/resume/types"

type EditorPanelProps = {
  data: ResumeData
  onChange: (data: ResumeData) => void
  onSave: (section: keyof ResumeData) => void
  saving: string | null
}

export function EditorPanel({ data, onChange, onSave, saving }: EditorPanelProps) {
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})

  const update = <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => {
    onChange({ ...data, [section]: value })
  }

  const withAILoading = useCallback(
    async (section: string, fn: () => Promise<void>) => {
      setAiLoading((prev) => ({ ...prev, [section]: true }))
      try {
        await fn()
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI request failed"
        toast.error(msg)
      } finally {
        setAiLoading((prev) => ({ ...prev, [section]: false }))
      }
    },
    [],
  )

  const handleImproveSummary = useCallback(async () => {
    await withAILoading("summary", async () => {
      const experience = data.experience.map((e) => e.description).filter(Boolean)
      const result = await suggestSummaryApi({
        job_title: data.personal.title || "",
        skills: data.skills.length > 0 ? data.skills : [""],
        experience: experience.length > 0 ? experience : [""],
        job_description: "",
        current_summary: data.summary || null,
      })
      update("summary", result.summary)
      toast.success("Summary improved")
    })
  }, [data, withAILoading, update])

  const handleSuggestSkills = useCallback(async () => {
    await withAILoading("skills", async () => {
      const result = await suggestSkillsApi({
        job_description: "",
        current_skills: data.skills.length > 0
          ? { other: data.skills }
          : { other: [] },
      })
      const allSkills = Object.values(result.skills).flat()
      update("skills", allSkills)
      update("skillGroups", result.skills)
      toast.success("Skills organized into groups")
    })
  }, [data, withAILoading, update])

  const handleImproveExperience = useCallback(async () => {
    await withAILoading("experience", async () => {
      const bullets = data.experience.map((e) => e.description).filter(Boolean)
      if (bullets.length === 0) {
        toast.error("Add at least one experience entry first")
        return
      }
      const first = data.experience[0]
      const result = await suggestExperienceApi({
        experience_bullets: bullets,
        job_role: first.role || "",
        company: first.company || null,
      })
      if (result.bullets.length === data.experience.length) {
        const next = data.experience.map((e, i) => ({ ...e, description: result.bullets[i] }))
        update("experience", next)
      } else {
        const next = data.experience.map((e, i) => ({
          ...e,
          description: result.bullets[i] ?? e.description,
        }))
        update("experience", next)
        toast.warning("Bullet count mismatch — some entries may not have been updated")
      }
      toast.success("Experience improved")
    })
  }, [data, withAILoading, update])

  const handleImproveProjects = useCallback(async () => {
    await withAILoading("projects", async () => {
      const descriptions = data.projects.map((p) => p.description).filter(Boolean)
      if (descriptions.length === 0) {
        toast.error("Add at least one project entry first")
        return
      }
      const first = data.projects[0]
      const techNames = data.skills.length > 0 ? data.skills : undefined
      const result = await suggestProjectsApi({
        project_descriptions: descriptions,
        project_name: first.name || null,
        tech_stack: techNames ?? null,
      })
      if (result.projects.length === data.projects.length) {
        const next = data.projects.map((p, i) => ({ ...p, description: result.projects[i] }))
        update("projects", next)
      } else {
        const next = data.projects.map((p, i) => ({
          ...p,
          description: result.projects[i] ?? p.description,
        }))
        update("projects", next)
        toast.warning("Project count mismatch — some entries may not have been updated")
      }
      toast.success("Projects improved")
    })
  }, [data, withAILoading, update])

  return (
    <div className="space-y-3">
      <FormSection
        title="Personal"
        defaultOpen
        actions={<SaveBtn section="personal" saving={saving} onSave={onSave} />}
      >
        <InputField label="Full Name" value={data.personal.name} onChange={(v) => update("personal", { ...data.personal, name: v })} placeholder="John Doe" />
        <InputField label="Job Title" value={data.personal.title} onChange={(v) => update("personal", { ...data.personal, title: v })} placeholder="Senior Product Designer" />
        <InputField label="Email" value={data.personal.email} onChange={(v) => update("personal", { ...data.personal, email: v })} placeholder="john@example.com" />
        <InputField label="Phone" value={data.personal.phone} onChange={(v) => update("personal", { ...data.personal, phone: v })} placeholder="+1 (555) 123-4567" />
        <InputField label="Location" value={data.personal.location} onChange={(v) => update("personal", { ...data.personal, location: v })} placeholder="San Francisco, CA" />
      </FormSection>

      <FormSection
        title="Links"
        actions={<SaveBtn section="links" saving={saving} onSave={onSave} />}
      >
        <InputField label="LinkedIn" value={data.links.linkedin} onChange={(v) => update("links", { ...data.links, linkedin: v })} placeholder="username" />
        <InputField label="GitHub" value={data.links.github} onChange={(v) => update("links", { ...data.links, github: v })} placeholder="username" />
        <InputField label="Portfolio" value={data.links.portfolio} onChange={(v) => update("links", { ...data.links, portfolio: v })} placeholder="https://" />
        <InputField label="Website" value={data.links.website} onChange={(v) => update("links", { ...data.links, website: v })} placeholder="https://" />
      </FormSection>

      <FormSection
        title="Summary"
        onAISuggest={handleImproveSummary}
        aiLoading={!!aiLoading.summary}
        actions={<SaveBtn section="summary" saving={saving} onSave={onSave} />}
      >
        <textarea
          value={data.summary}
          onChange={(e) => update("summary", e.target.value)}
          rows={5}
          className="w-full resize-none rounded-lg border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Professional summary highlighting your key qualifications..."
        />
      </FormSection>

      <FormSection
        title="Skills"
        onAISuggest={handleSuggestSkills}
        aiLoading={!!aiLoading.skills}
        actions={<SaveBtn section="skills" saving={saving} onSave={onSave} />}
      >
        <TagInput
          tags={data.skills}
          onChange={(v) => {
            update("skills", v)
            update("skillGroups", null)
          }}
          placeholder="Type a skill and press Enter..."
        />
        {data.skillGroups && Object.keys(data.skillGroups).length > 0 && (
          <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Grouped Preview</p>
            {Object.entries(data.skillGroups).map(([group, skills]) => (
              <div key={group} className="text-xs">
                <span className="font-semibold text-foreground">{group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: </span>
                <span className="text-muted-foreground">{skills.join(", ")}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Edit skills above, or use AI to organize into groups</p>
      </FormSection>

      <FormSection
        title="Experience"
        onAISuggest={handleImproveExperience}
        aiLoading={!!aiLoading.experience}
        actions={<SaveBtn section="experience" saving={saving} onSave={onSave} />}
      >
        <ExperienceEditor
          entries={data.experience}
          onChange={(v) => update("experience", v)}
        />
      </FormSection>

      <FormSection
        title="Projects"
        onAISuggest={handleImproveProjects}
        aiLoading={!!aiLoading.projects}
        actions={<SaveBtn section="projects" saving={saving} onSave={onSave} />}
      >
        <ProjectsEditor
          entries={data.projects}
          onChange={(v) => update("projects", v)}
        />
      </FormSection>

      <FormSection
        title="Education"
        actions={<SaveBtn section="education" saving={saving} onSave={onSave} />}
      >
        <EducationEditor
          entries={data.education}
          onChange={(v) => update("education", v)}
        />
      </FormSection>

      <FormSection
        title="Certifications"
        actions={<SaveBtn section="certifications" saving={saving} onSave={onSave} />}
      >
        <CertificationsEditor
          entries={data.certifications}
          onChange={(v) => update("certifications", v)}
        />
      </FormSection>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder={placeholder}
      />
    </div>
  )
}

function ExperienceEditor({ entries, onChange }: { entries: ExperienceEntry[]; onChange: (v: ExperienceEntry[]) => void }) {
  const add = () => onChange([...entries, { company: "", role: "", startDate: "", endDate: "", description: "" }])
  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i))
  const updateEntry = (i: number, key: keyof ExperienceEntry, val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {entries.map((e, i) => (
        <div key={i} className="rounded-lg border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">#{i + 1}</span>
            <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={e.company} onChange={(ev) => updateEntry(i, "company", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Company" />
            <input value={e.role} onChange={(ev) => updateEntry(i, "role", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Role" />
            <input value={e.startDate} onChange={(ev) => updateEntry(i, "startDate", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Start date" />
            <input value={e.endDate} onChange={(ev) => updateEntry(i, "endDate", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="End date" />
          </div>
          <textarea value={e.description} onChange={(ev) => updateEntry(i, "description", ev.target.value)} rows={3} className="w-full resize-none rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Describe your responsibilities and achievements..." />
        </div>
      ))}
      <button onClick={add} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
        <Plus className="size-3.5" /> Add Experience
      </button>
    </div>
  )
}

function ProjectsEditor({ entries, onChange }: { entries: ProjectEntry[]; onChange: (v: ProjectEntry[]) => void }) {
  const add = () => onChange([...entries, { name: "", description: "" }])
  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i))
  const updateEntry = (i: number, key: keyof ProjectEntry, val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {entries.map((p, i) => (
        <div key={i} className="rounded-lg border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <input value={p.name} onChange={(ev) => updateEntry(i, "name", ev.target.value)} className="flex-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Project name" />
            <button onClick={() => remove(i)} className="ml-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
          </div>
          <textarea value={p.description} onChange={(ev) => updateEntry(i, "description", ev.target.value)} rows={2} className="w-full resize-none rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Project description..." />
        </div>
      ))}
      <button onClick={add} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
        <Plus className="size-3.5" /> Add Project
      </button>
    </div>
  )
}

function EducationEditor({ entries, onChange }: { entries: EducationEntry[]; onChange: (v: EducationEntry[]) => void }) {
  const add = () => onChange([...entries, { school: "", degree: "", field: "", startDate: "", endDate: "" }])
  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i))
  const updateEntry = (i: number, key: keyof EducationEntry, val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {entries.map((e, i) => (
        <div key={i} className="rounded-lg border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">#{i + 1}</span>
            <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={e.school} onChange={(ev) => updateEntry(i, "school", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="School" />
            <input value={e.degree} onChange={(ev) => updateEntry(i, "degree", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Degree" />
            <input value={e.field} onChange={(ev) => updateEntry(i, "field", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Field of study" />
            <div className="grid grid-cols-2 gap-1">
              <input value={e.startDate} onChange={(ev) => updateEntry(i, "startDate", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Start" />
              <input value={e.endDate} onChange={(ev) => updateEntry(i, "endDate", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="End" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
        <Plus className="size-3.5" /> Add Education
      </button>
    </div>
  )
}

function SaveBtn({ section, saving, onSave }: { section: keyof ResumeData; saving: string | null; onSave: (s: keyof ResumeData) => void }) {
  const isSaving = saving === section
  return (
    <Button size="xs" variant="outline" onClick={() => onSave(section)} disabled={isSaving}>
      <Save className="size-3" />
      {isSaving ? "Saving..." : "Save"}
    </Button>
  )
}

function CertificationsEditor({ entries, onChange }: { entries: CertificationEntry[]; onChange: (v: CertificationEntry[]) => void }) {
  const add = () => onChange([...entries, { name: "", issuer: "", date: "" }])
  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i))
  const updateEntry = (i: number, key: keyof CertificationEntry, val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {entries.map((c, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border bg-background p-3">
          <div className="flex-1 space-y-2">
            <input value={c.name} onChange={(ev) => updateEntry(i, "name", ev.target.value)} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Certification name" />
            <div className="grid grid-cols-2 gap-2">
              <input value={c.issuer} onChange={(ev) => updateEntry(i, "issuer", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Issuer" />
              <input value={c.date} onChange={(ev) => updateEntry(i, "date", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Date" />
            </div>
          </div>
          <button onClick={() => remove(i)} className="mt-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
        <Plus className="size-3.5" /> Add Certification
      </button>
    </div>
  )
}
