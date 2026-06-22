"use client"

import { useResumeStore } from "@/store/resume-store"

export function ThemeEditor() {
  const theme = useResumeStore((s) => s.resume.theme)
  const updateTheme = useResumeStore((s) => s.updateTheme)

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
      <p className="text-xs font-semibold text-foreground">Theme Settings</p>

      <div className="grid grid-cols-2 gap-3">
        <ColorField label="Primary" value={theme.primaryColor} onChange={(v) => updateTheme({ primaryColor: v })} />
        <ColorField label="Text" value={theme.textColor} onChange={(v) => updateTheme({ textColor: v })} />
        <ColorField label="Accent" value={theme.accentColor} onChange={(v) => updateTheme({ accentColor: v })} />
        <ColorField label="Background" value={theme.backgroundColor} onChange={(v) => updateTheme({ backgroundColor: v })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-muted-foreground">Font Size</label>
          <select
            value={theme.fontSize}
            onChange={(e) => updateTheme({ fontSize: e.target.value as typeof theme.fontSize })}
            className="field-input text-xs"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-muted-foreground">Spacing</label>
          <select
            value={theme.spacing}
            onChange={(e) => updateTheme({ spacing: e.target.value as typeof theme.spacing })}
            className="field-input text-xs"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-muted-foreground">Section Title Style</label>
        <select
          value={theme.sectionStyle}
          onChange={(e) => updateTheme({ sectionStyle: e.target.value as typeof theme.sectionStyle })}
          className="field-input text-xs"
        >
          <option value="underline">Underline</option>
          <option value="border">Border</option>
          <option value="filled">Filled</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-6 rounded cursor-pointer border border-border shrink-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field-input text-xs flex-1 font-mono"
        />
      </div>
    </div>
  )
}
