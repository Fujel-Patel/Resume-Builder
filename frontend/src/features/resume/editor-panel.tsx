"use client"

import { useState, useCallback, useEffect } from "react"
import { FormSection } from "@/features/resume/form-section"
import { TagInput } from "@/features/resume/tag-input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, Loader2, Sparkles } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import {
  suggestSummaryApi,
  suggestSkillsApi,
  suggestExperienceApi,
  suggestProjectsApi,
  suggestJobTitleApi,
} from "@/lib/api/ai-suggest"
import type { ResumeData, ExperienceEntry, EducationEntry, ProjectEntry, CertificationEntry, CustomSection } from "@/features/resume/types"

type EditorPanelProps = {
  data: ResumeData
  onChange: (data: ResumeData) => void
  onSave: (section: keyof ResumeData) => void
  saving: string | null
}

export function EditorPanel({ data, onChange, onSave, saving }: EditorPanelProps) {
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  const [pendingDelete, setPendingDelete] = useState<{ section: string; index: number } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showJobDesc, setShowJobDesc] = useState(() => localStorage.getItem("resume_jd_show") === "true")
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem("resume_jd_text") || "")

  useEffect(() => {
    localStorage.setItem("resume_jd_show", String(showJobDesc))
  }, [showJobDesc])

  useEffect(() => {
    localStorage.setItem("resume_jd_text", jobDescription)
  }, [jobDescription])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    const { section, index } = pendingDelete
    await new Promise((r) => setTimeout(r, 400))
    if (section === "experience") {
      onChange({ ...data, experience: data.experience.filter((_, i) => i !== index) })
    } else if (section === "projects") {
      onChange({ ...data, projects: data.projects.filter((_, i) => i !== index) })
    } else if (section === "education") {
      onChange({ ...data, education: data.education.filter((_, i) => i !== index) })
    } else if (section === "certifications") {
      onChange({ ...data, certifications: data.certifications.filter((_, i) => i !== index) })
    } else if (section === "customSections") {
      onChange({ ...data, customSections: data.customSections.filter((_, i) => i !== index) })
    }
    setPendingDelete(null)
    setDeleting(false)
  }

  const update = <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => {
    onChange({ ...data, [section]: value })
  }

  const withAILoading = useCallback(
    async (section: string, fn: () => Promise<void>) => {
      setAiLoading((prev) => ({ ...prev, [section]: true }))
      try {
        await fn()
      } catch (err) {
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
        job_description: jobDescription || "",
        current_summary: data.summary || null,
      })
      update("summary", result.summary)
    })
  }, [data, jobDescription, withAILoading, update])

  const handleSuggestSkills = useCallback(async () => {
    await withAILoading("skills", async () => {
      const result = await suggestSkillsApi({
        job_description: jobDescription || "",
        current_skills: data.skills.length > 0
          ? { other: data.skills }
          : { other: [] },
      })
      const allSkills = Object.values(result.skills).flat()
      update("skills", allSkills)
      update("skillGroups", result.skills)
    })
  }, [data, jobDescription, withAILoading, update])

  const handleImproveExperience = useCallback(async () => {
    await withAILoading("experience", async () => {
      const bullets = data.experience.map((e) => e.description).filter(Boolean)
      if (bullets.length === 0) {
        return
      }
      const first = data.experience[0]
      const result = await suggestExperienceApi({
        experience_bullets: bullets,
        job_role: first.role || "",
        company: first.company || null,
        job_description: jobDescription || null,
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
      }
    })
  }, [data, jobDescription, withAILoading, update])

  const handleImproveProjects = useCallback(async () => {
    await withAILoading("projects", async () => {
      const descriptions = data.projects.map((p) => p.description).filter(Boolean)
      if (descriptions.length === 0) {
        return
      }
      const first = data.projects[0]
      const techNames = data.skills.length > 0 ? data.skills : undefined
      const result = await suggestProjectsApi({
        project_descriptions: descriptions,
        project_name: first.name || null,
        tech_stack: techNames ?? null,
        job_description: jobDescription || null,
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
      }
    })
  }, [data, jobDescription, withAILoading, update])

  const handleSuggestJobTitle = useCallback(async () => {
    if (!jobDescription.trim()) return
    await withAILoading("jobTitle", async () => {
      const result = await suggestJobTitleApi({
        job_description: jobDescription,
        current_title: data.personal.title || null,
      })
      update("personal", { ...data.personal, title: result.title })
    })
  }, [data, jobDescription, withAILoading, update])

  return (
    <div className="space-y-3">
      <div className="rounded-card border bg-card">
        <label className="flex cursor-pointer select-none items-center gap-2 px-4 py-3">
          <input
            type="checkbox"
            checked={showJobDesc}
            onChange={(e) => setShowJobDesc(e.target.checked)}
            className="rounded border-border text-brand focus:ring-brand/30"
          />
          <span className="text-sm font-medium text-foreground">
            Use Job Description <span className="text-xs text-muted-foreground">(for AI optimization)</span>
          </span>
        </label>
        {showJobDesc && (
          <div className="px-4 pb-4">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Paste the job description here to get AI suggestions tailored to the role..."
            />
          </div>
        )}
      </div>

      <FormSection
        title="Personal"
        defaultOpen
        actions={<SaveBtn section="personal" saving={saving} onSave={onSave} />}
      >
        <InputField label="Full Name" value={data.personal.name} onChange={(v) => update("personal", { ...data.personal, name: v })} placeholder="John Doe" />
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Job Title</label>
          <div className="flex gap-1.5">
            <input
              value={data.personal.title}
              onChange={(e) => update("personal", { ...data.personal, title: e.target.value })}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Senior Product Designer"
            />
            {showJobDesc && jobDescription.trim() && (
              <button
                type="button"
                onClick={handleSuggestJobTitle}
                disabled={!!aiLoading.jobTitle}
                className="flex shrink-0 items-center justify-center rounded-lg border border-border px-2.5 text-muted-foreground hover:text-brand hover:border-brand/30 transition-colors disabled:opacity-50"
                aria-label="AI suggest job title"
              >
                {aiLoading.jobTitle ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              </button>
            )}
          </div>
        </div>
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
            {Object.entries(data.skillGroups).map(([group, skills]) => {
              const label: Record<string, string> = {
                languages: "Languages",
                frontend: "Frontend",
                backend: "Backend",
                database: "Database",
                devops: "DevOps & Tools",
                ai_tools: "AI Tools",
                other: "Other",
              }
              return (
                <div key={group} className="text-xs">
                  <span className="font-semibold text-foreground">{label[group] || group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: </span>
                  <span className="text-muted-foreground">{skills.join(", ")}</span>
                </div>
              )
            })}
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
          onRemove={(i) => setPendingDelete({ section: "experience", index: i })}
          deletingIndex={pendingDelete?.section === "experience" ? pendingDelete.index : -1}
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
          onRemove={(i) => setPendingDelete({ section: "projects", index: i })}
          deletingIndex={pendingDelete?.section === "projects" ? pendingDelete.index : -1}
        />
      </FormSection>

      <FormSection
        title="Education"
        actions={<SaveBtn section="education" saving={saving} onSave={onSave} />}
      >
        <EducationEditor
          entries={data.education}
          onChange={(v) => update("education", v)}
          onRemove={(i) => setPendingDelete({ section: "education", index: i })}
          deletingIndex={pendingDelete?.section === "education" ? pendingDelete.index : -1}
        />
      </FormSection>

      <FormSection
        title="Certifications"
        actions={<SaveBtn section="certifications" saving={saving} onSave={onSave} />}
      >
        <CertificationsEditor
          entries={data.certifications}
          onChange={(v) => update("certifications", v)}
          onRemove={(i) => setPendingDelete({ section: "certifications", index: i })}
          deletingIndex={pendingDelete?.section === "certifications" ? pendingDelete.index : -1}
        />
      </FormSection>

      <FormSection
        title="Custom Sections"
        actions={<SaveBtn section="customSections" saving={saving} onSave={onSave} />}
      >
        <CustomSectionsEditor
          entries={data.customSections}
          onChange={(v) => update("customSections", v)}
          onRemove={(i) => setPendingDelete({ section: "customSections", index: i })}
          deletingIndex={pendingDelete?.section === "customSections" ? pendingDelete.index : -1}
        />
      </FormSection>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="size-4 animate-spin" /> Removing...</> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

function ExperienceEditor({ entries, onChange, onRemove, deletingIndex }: { entries: ExperienceEntry[]; onChange: (v: ExperienceEntry[]) => void; onRemove: (i: number) => void; deletingIndex: number }) {
  const add = () => onChange([...entries, { company: "", role: "", startDate: "", endDate: "", description: "" }])
  const updateEntry = (i: number, key: keyof ExperienceEntry, val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {entries.map((e, i) => (
        <div key={i} className={`rounded-lg border bg-background p-3 space-y-2 ${i === deletingIndex ? "swipe-delete" : ""}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">#{i + 1}</span>
            <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
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

function ProjectsEditor({ entries, onChange, onRemove, deletingIndex }: { entries: ProjectEntry[]; onChange: (v: ProjectEntry[]) => void; onRemove: (i: number) => void; deletingIndex: number }) {
  const add = () => onChange([...entries, { name: "", description: "" }])
  const updateEntry = (i: number, key: keyof ProjectEntry, val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {entries.map((p, i) => (
        <div key={i} className={`rounded-lg border bg-background p-3 space-y-2 ${i === deletingIndex ? "swipe-delete" : ""}`}>
          <div className="flex items-center justify-between">
            <input value={p.name} onChange={(ev) => updateEntry(i, "name", ev.target.value)} className="flex-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Project name" />
            <button onClick={() => onRemove(i)} className="ml-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
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

function EducationEditor({ entries, onChange, onRemove, deletingIndex }: { entries: EducationEntry[]; onChange: (v: EducationEntry[]) => void; onRemove: (i: number) => void; deletingIndex: number }) {
  const add = () => onChange([...entries, { school: "", degree: "", field: "", startDate: "", endDate: "" }])
  const updateEntry = (i: number, key: keyof EducationEntry, val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {entries.map((e, i) => (
        <div key={i} className={`rounded-lg border bg-background p-3 space-y-2 ${i === deletingIndex ? "swipe-delete" : ""}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">#{i + 1}</span>
            <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
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

function CustomSectionsEditor({ entries, onChange, onRemove, deletingIndex }: { entries: CustomSection[]; onChange: (v: CustomSection[]) => void; onRemove: (i: number) => void; deletingIndex: number }) {
  const add = () => onChange([...entries, { label: "", content: "" }])
  const updateEntry = (i: number, key: keyof CustomSection, val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {entries.map((s, i) => (
        <div key={i} className={`rounded-lg border bg-background p-3 space-y-2 ${i === deletingIndex ? "swipe-delete" : ""}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">#{i + 1}</span>
            <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
          </div>
          <input value={s.label} onChange={(ev) => updateEntry(i, "label", ev.target.value)} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Section label (e.g. Languages, Awards)" />
          <textarea value={s.content} onChange={(ev) => updateEntry(i, "content", ev.target.value)} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Content (one per line)" rows={3} />
        </div>
      ))}
      <button onClick={add} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
        <Plus className="size-3.5" /> Add Custom Section
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

function CertificationsEditor({ entries, onChange, onRemove, deletingIndex }: { entries: CertificationEntry[]; onChange: (v: CertificationEntry[]) => void; onRemove: (i: number) => void; deletingIndex: number }) {
  const add = () => onChange([...entries, { name: "", issuer: "", date: "" }])
  const updateEntry = (i: number, key: keyof CertificationEntry, val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {entries.map((c, i) => (
        <div key={i} className={`flex items-start gap-2 rounded-lg border bg-background p-3 ${i === deletingIndex ? "swipe-delete" : ""}`}>
          <div className="flex-1 space-y-2">
            <input value={c.name} onChange={(ev) => updateEntry(i, "name", ev.target.value)} className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Certification name" />
            <div className="grid grid-cols-2 gap-2">
              <input value={c.issuer} onChange={(ev) => updateEntry(i, "issuer", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Issuer" />
              <input value={c.date} onChange={(ev) => updateEntry(i, "date", ev.target.value)} className="rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Date" />
            </div>
          </div>
          <button onClick={() => onRemove(i)} className="mt-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
        <Plus className="size-3.5" /> Add Certification
      </button>
    </div>
  )
}
