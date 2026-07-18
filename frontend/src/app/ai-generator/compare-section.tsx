"use client"

export function CompareSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-2">
        <p className="text-xs font-medium text-foreground">{label}</p>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
