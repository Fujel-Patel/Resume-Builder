"use client"

import { Badge } from "@/components/ui/badge"
import { CompareSection } from "./compare-section"
import { diff, diffArr, experienceKey, hasExperienceDiff, hasProjectDiff } from "./ai-generator-utils"
import type { ResumeData } from "@/features/resume/types"

export function CompareStep({
  parsedFrontend,
  optimizedFrontend,
  error,
}: {
  parsedFrontend: ResumeData
  optimizedFrontend: ResumeData
  error: string | null
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Review AI changes</h2>
          <p className="text-sm text-muted-foreground">Review changes before applying them to your resume.</p>
        </div>
        <Badge variant="success">Optimized</Badge>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {diff(parsedFrontend.personal.title, optimizedFrontend.personal.title) && (
          <CompareSection label="Job Title">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-[11px] text-muted-foreground mb-1">Original</p>
                <p className="text-sm text-foreground">{parsedFrontend.personal.title || "(none)"}</p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-[11px] text-emerald-600 mb-1">Optimized</p>
                <p className="text-sm font-medium text-foreground">{optimizedFrontend.personal.title || "(none)"}</p>
              </div>
            </div>
          </CompareSection>
        )}

        {diff(parsedFrontend.summary, optimizedFrontend.summary) && (
          <CompareSection label="Professional Summary">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-[11px] text-muted-foreground mb-1">Original</p>
                <p className="text-xs leading-relaxed text-foreground">{parsedFrontend.summary || "(none)"}</p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-[11px] text-emerald-600 mb-1">Optimized</p>
                <p className="text-xs leading-relaxed text-foreground">{optimizedFrontend.summary || "(none)"}</p>
              </div>
            </div>
          </CompareSection>
        )}

        {diffArr(parsedFrontend.skills, optimizedFrontend.skills) && (
          <CompareSection label="Skills">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-[11px] text-muted-foreground mb-2">Original</p>
                <div className="flex flex-wrap gap-1.5">
                  {parsedFrontend.skills.map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-[11px] text-emerald-600 mb-2">Optimized</p>
                <div className="flex flex-wrap gap-1.5">
                  {optimizedFrontend.skills.map((s) => (
                    <span key={s} className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-700 font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </CompareSection>
        )}

        {(() => {
          const origExpMap = new Map(parsedFrontend.experience.map(e => [experienceKey(e), e]))
          const optExpMap = new Map(optimizedFrontend.experience.map(e => [experienceKey(e), e]))
          const expSections: React.ReactNode[] = []

          for (const exp of optimizedFrontend.experience) {
            const key = experienceKey(exp)
            const orig = origExpMap.get(key)
            if (!orig) {
              expSections.push(
                <CompareSection key={`exp-new-${key}`} label={`Experience — ${exp.role} @ ${exp.company}`}>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <p className="text-[11px] text-emerald-600 mb-1">Added by AI</p>
                    <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                      {exp.description || "(no description)"}
                    </p>
                  </div>
                </CompareSection>,
              )
            } else if (hasExperienceDiff(orig, exp)) {
              expSections.push(
                <CompareSection key={`exp-${key}`} label={`Experience — ${exp.role} @ ${exp.company}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-card p-3 space-y-2">
                      <p className="text-[11px] text-muted-foreground">Original</p>
                      {(diff(orig.role, exp.role) || diff(orig.company, exp.company)) && (
                        <p className="text-xs font-medium text-foreground">{orig.role} @ {orig.company}</p>
                      )}
                      {diff(orig.startDate, exp.startDate) || diff(orig.endDate, exp.endDate) ? (
                        <p className="text-[11px] text-muted-foreground">{orig.startDate} — {orig.endDate}</p>
                      ) : null}
                      <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{orig.description || "(none)"}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
                      <p className="text-[11px] text-emerald-600">Optimized</p>
                      {(diff(orig.role, exp.role) || diff(orig.company, exp.company)) && (
                        <p className="text-xs font-medium text-foreground">{exp.role} @ {exp.company}</p>
                      )}
                      {diff(orig.startDate, exp.startDate) || diff(orig.endDate, exp.endDate) ? (
                        <p className="text-[11px] text-muted-foreground">{exp.startDate} — {exp.endDate}</p>
                      ) : null}
                      <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{exp.description || "(none)"}</p>
                    </div>
                  </div>
                </CompareSection>,
              )
            }
          }

          for (const exp of parsedFrontend.experience) {
            if (!optExpMap.has(experienceKey(exp))) {
              expSections.push(
                <CompareSection key={`exp-removed-${experienceKey(exp)}`} label={`Experience — ${exp.role} @ ${exp.company}`}>
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-[11px] text-destructive mb-1">Removed by AI</p>
                    <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{exp.description || "(none)"}</p>
                  </div>
                </CompareSection>,
              )
            }
          }

          return expSections
        })()}

        {(() => {
          const origProjMap = new Map(parsedFrontend.projects.map(p => [p.name, p]))
          const optProjMap = new Map(optimizedFrontend.projects.map(p => [p.name, p]))
          const projSections: React.ReactNode[] = []

          for (const proj of optimizedFrontend.projects) {
            const orig = origProjMap.get(proj.name)
            if (!orig) {
              projSections.push(
                <CompareSection key={`proj-new-${proj.name}`} label={`Project — ${proj.name}`}>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <p className="text-[11px] text-emerald-600 mb-1">Added by AI</p>
                    <p className="text-xs leading-relaxed text-foreground">{proj.description || "(no description)"}</p>
                  </div>
                </CompareSection>,
              )
            } else if (hasProjectDiff(orig, proj)) {
              projSections.push(
                <CompareSection key={`proj-${proj.name}`} label={`Project — ${proj.name}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-card p-3 space-y-2">
                      <p className="text-[11px] text-muted-foreground">Original</p>
                      {diff(orig.name, proj.name) && (
                        <p className="text-xs font-medium text-foreground">{orig.name}</p>
                      )}
                      <p className="text-xs leading-relaxed text-foreground">{orig.description || "(none)"}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
                      <p className="text-[11px] text-emerald-600">Optimized</p>
                      {diff(orig.name, proj.name) && (
                        <p className="text-xs font-medium text-foreground">{proj.name}</p>
                      )}
                      <p className="text-xs leading-relaxed text-foreground">{proj.description || "(none)"}</p>
                    </div>
                  </div>
                </CompareSection>,
              )
            }
          }

          for (const proj of parsedFrontend.projects) {
            if (!optProjMap.has(proj.name)) {
              projSections.push(
                <CompareSection key={`proj-removed-${proj.name}`} label={`Project — ${proj.name}`}>
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-[11px] text-destructive mb-1">Removed by AI</p>
                    <p className="text-xs leading-relaxed text-foreground">{proj.description || "(none)"}</p>
                  </div>
                </CompareSection>,
              )
            }
          }

          return projSections
        })()}

        {!diff(parsedFrontend.personal.title, optimizedFrontend.personal.title) &&
          !diff(parsedFrontend.summary, optimizedFrontend.summary) &&
          !diffArr(parsedFrontend.skills, optimizedFrontend.skills) &&
          parsedFrontend.experience.every((e, i) => {
            const key = experienceKey(e)
            const opt = optimizedFrontend.experience.find(o => experienceKey(o) === key)
            return opt ? !hasExperienceDiff(e, opt) : false
          }) &&
          optimizedFrontend.experience.every((e) =>
            parsedFrontend.experience.some(o => experienceKey(o) === experienceKey(e)),
          ) &&
          parsedFrontend.projects.every((p) => {
            const opt = optimizedFrontend.projects.find(o => o.name === p.name)
            return opt ? !hasProjectDiff(p, opt) : false
          }) &&
          optimizedFrontend.projects.every((p) =>
            parsedFrontend.projects.some(o => o.name === p.name),
          ) && (
            <div className="rounded-lg border bg-muted/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">No changes detected. Your resume is already well-optimized for this role.</p>
            </div>
          )}
      </div>
    </div>
  )
}
