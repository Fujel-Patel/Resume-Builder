import type { LucideIcon } from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type StatCardData = {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    direction: "up" | "down"
    value: string
  }
}

export type ATSResult = {
  overallScore: number
  sectionScores: {
    format: number
    keywords: number
    readability: number
    completeness: number
  }
  missingKeywords: string[]
  suggestions: string[]
}
