"use client"

import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type AISuggestButtonProps = {
  section: "summary" | "skills" | "experience" | "projects"
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}

const labels: Record<string, string> = {
  summary: "Improve Summary",
  skills: "Suggest Skills",
  experience: "Improve Bullets",
  projects: "Improve Description",
}

export function AISuggestButton({
  section,
  loading = false,
  disabled = false,
  onClick,
}: AISuggestButtonProps) {
  return (
    <Button
      variant="brandGhost"
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
      {loading ? "Generating..." : labels[section]}
    </Button>
  )
}
