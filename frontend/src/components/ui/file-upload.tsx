"use client"

import { useRef, useState } from "react"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type FileUploadProps = {
  onFile: (file: File) => void
  accept?: string
  className?: string
}

export function FileUpload({ onFile, accept = ".pdf,.docx", className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed p-8 text-center transition-all duration-200",
        dragging
          ? "border-brand bg-brand/5"
          : "border-border hover:border-muted-foreground/30",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        {dragging ? (
          <FileText className="size-6 text-brand" />
        ) : (
          <Upload className="size-6 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          {dragging ? "Drop your file here" : "Upload your resume"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Drag and drop, or click to browse
        </p>
      </div>
      <Button type="button" variant="brandOutline" size="sm">
        Choose File
      </Button>
      <p className="text-xs text-muted-foreground">PDF or DOCX, max 5MB</p>
    </div>
  )
}
