"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type TagInputProps = {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Type and press Enter...",
  className,
}: TagInputProps) {
  const [input, setInput] = useState("")

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput("")
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-1.5 rounded-input border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="h-6 gap-1 pr-1 text-xs">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="flex items-center rounded-sm hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-20 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
