"use client"

import { type BackendResumeContent } from "@/lib/api/ai-suggest"
import { toFrontendFromContent } from "@/lib/api/resumes"
import type { ResumeData } from "@/features/resume/types"

export function toFrontend(d: BackendResumeContent | null): ResumeData | null {
  if (!d || typeof d !== "object") return null
  return toFrontendFromContent(d as unknown as Record<string, unknown>)
}

export function diff(a: string | undefined | null, b: string | undefined | null): boolean {
  const av = a?.trim() || ""
  const bv = b?.trim() || ""
  return av !== bv
}

export function diffArr<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  if (!a && !b) return false
  if (!a || !b) return true
  if (a.length !== b.length) return true
  return JSON.stringify(a) !== JSON.stringify(b)
}

export function experienceKey(e: { company: string; role: string }) {
  return `${e.company}|||${e.role}`
}

export function hasExperienceDiff(
  orig: { company: string; role: string; startDate: string; endDate: string; description: string },
  opt: { company: string; role: string; startDate: string; endDate: string; description: string },
) {
  return diff(orig.company, opt.company) || diff(orig.role, opt.role) ||
    diff(orig.startDate, opt.startDate) || diff(orig.endDate, opt.endDate) ||
    diff(orig.description, opt.description)
}

export function hasProjectDiff(
  orig: { name: string; description: string },
  opt: { name: string; description: string },
) {
  return diff(orig.name, opt.name) || diff(orig.description, opt.description)
}
