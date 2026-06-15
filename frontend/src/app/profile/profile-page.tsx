"use client"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { User, Mail, Phone, MapPin, Globe, Save } from "lucide-react"

export function ProfilePage() {
  return (
    <DashboardShell title="Profile">
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your personal information.</p>
        </div>

        <EnhancedCard>
          <div className="flex items-center gap-4 pb-4 border-b mb-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-brand/10 text-2xl font-bold text-brand">
              JD
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">Change Avatar</Button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" defaultValue="John Doe" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" defaultValue="john@example.com" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" defaultValue="San Francisco, CA" />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" defaultValue="https://johndoe.dev" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t pt-4">
            <Button variant="brand">
              <Save className="size-4" />
              Save Changes
            </Button>
          </div>
        </EnhancedCard>
      </div>
    </DashboardShell>
  )
}
