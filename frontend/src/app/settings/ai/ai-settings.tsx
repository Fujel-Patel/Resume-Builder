"use client"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Key, Save, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function AiSettingsPage() {
  const [showKey, setShowKey] = useState(false)

  return (
    <DashboardShell title="AI Settings">
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Settings</h2>
          <p className="text-sm text-muted-foreground">Configure your AI generation preferences.</p>
        </div>

        <EnhancedCard>
          <h3 className="mb-4 text-sm font-semibold text-foreground">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">OpenAI API Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showKey ? "text" : "password"}
                  className="w-full rounded-lg border bg-background py-2 pl-9 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  defaultValue="sk-...xyz"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Your key is stored encrypted and never shared.</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">AI Model</p>
                <p className="text-xs text-muted-foreground">GPT-4o &mdash; Best quality, faster responses</p>
              </div>
              <Badge variant="brand">Active</Badge>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Generation Preferences</h3>
          <div className="space-y-4">
            {[
              { label: "Auto-optimize on save", desc: "Run ATS optimization when saving a resume" },
              { label: "Include contact QR", desc: "Add a QR code to your contact section" },
              { label: "Suggest keywords from JD", desc: "Auto-extract keywords from job descriptions" },
              { label: "Enable grammar check", desc: "Check spelling and grammar in all sections" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-card after:transition-all peer-checked:bg-brand peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end border-t pt-4">
            <Button variant="brand">
              <Save className="size-4" />
              Save Settings
            </Button>
          </div>
        </EnhancedCard>

        <EnhancedCard>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Usage</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">AI Generations this month</span>
                <span className="text-xs text-muted-foreground">47 / 100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[47%] rounded-full bg-brand" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Resets on July 1, 2026</p>
          </div>
        </EnhancedCard>
      </div>
    </DashboardShell>
  )
}
