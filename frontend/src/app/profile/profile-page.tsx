"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { User, Mail, Save, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateMeApi, deleteMeApi } from "@/lib/api/auth"
import { setUser } from "@/lib/features/auth/authSlice"
import { clearAccessToken } from "@/lib/auth/token-manager"

export function ProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)

  const [name, setName] = useState(user?.name ?? "")
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSave = useCallback(async () => {
    if (!name.trim()) return
    setSaving(true)
    setSaveMessage(null)
    try {
      const updated = await updateMeApi({ name: name.trim() })
      dispatch(setUser(updated))
      setSaveMessage("Profile saved successfully")
    } catch {
      setSaveMessage("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }, [name, dispatch])

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirm !== "DELETE MY ACCOUNT") return
    setDeleting(true)
    try {
      await deleteMeApi(deleteConfirm)
      clearAccessToken()
      router.push("/login")
    } catch {
      setDeleting(false)
      setSaveMessage("Failed to delete account")
    }
  }, [deleteConfirm, router])

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
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm text-muted-foreground focus:outline-none"
                    value={user?.email ?? ""}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div>
              {saveMessage && (
                <span className={`flex items-center gap-1.5 text-xs ${saveMessage.includes("success") ? "text-green-600" : "text-destructive"}`}>
                  {saveMessage.includes("success") ? <CheckCircle className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
                  {saveMessage}
                </span>
              )}
            </div>
            <Button variant="brand" onClick={handleSave} disabled={saving || !name.trim()}>
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </EnhancedCard>

        <EnhancedCard className="border-destructive/20 ring-destructive/10">
          <h3 className="text-sm font-semibold text-foreground mb-1">Delete Account</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="min-w-0 flex-1 rounded-lg border border-destructive/30 bg-background py-2 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50"
              placeholder='Type "DELETE MY ACCOUNT" to confirm'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            <Button
              variant="destructive"
              size="default"
              disabled={deleteConfirm !== "DELETE MY ACCOUNT" || deleting}
              onClick={handleDeleteAccount}
            >
              <Trash2 className="size-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </EnhancedCard>
      </div>
    </DashboardShell>
  )
}
