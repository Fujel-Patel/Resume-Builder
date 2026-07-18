"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react"

export function ProcessingStep({
  error,
  progress,
  stageLabel,
  elapsed,
  onRetry,
}: {
  error: string | null
  progress: number
  stageLabel: string
  elapsed: number
  onRetry: () => void
}) {
  return (
    <div className="mx-auto max-w-md flex flex-col items-center justify-center py-16 text-center">
      {error ? (
        <>
          <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-foreground">Processing failed</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">{error}</p>
          <Button variant="brand" className="mt-6" onClick={onRetry}>
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </>
      ) : (
        <>
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
            <div className="relative flex size-20 items-center justify-center rounded-full bg-brand/10">
              <Sparkles className="size-8 text-brand" />
            </div>
          </div>
          <h2 className="mt-6 text-lg font-semibold text-foreground">AI is processing your resume</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {elapsed > 0 ? `${stageLabel} (${elapsed}s)` : stageLabel}
          </p>
          <div className="mt-6 w-full max-w-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium text-foreground">{Math.min(progress, 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
