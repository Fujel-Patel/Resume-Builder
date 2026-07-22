"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Eye, EyeOff, Loader2, ShieldCheck, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { changePassword } from "@/lib/api/auth"
import { changePasswordSchema } from "@/schemas/auth"

const PASSWORD_SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;]/u

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One digit", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => PASSWORD_SPECIAL_CHARS.test(p) },
] as const

function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (PASSWORD_SPECIAL_CHARS.test(password)) score++
  return Math.min(score, 4)
}

function getStrengthLabel(score: number): { label: string; color: string } {
  if (score <= 1) return { label: "Weak", color: "text-destructive" }
  if (score === 2) return { label: "Fair", color: "text-orange-500" }
  if (score === 3) return { label: "Good", color: "text-emerald-500" }
  return { label: "Strong", color: "text-emerald-500" }
}

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const validate = (): boolean => {
    const result = changePasswordSchema.safeParse({ currentPassword, password, confirmPassword })
    if (result.success) {
      setErrors({})
      return true
    }
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    setErrors(fieldErrors)
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    if (!validate()) return
    setLoading(true)
    try {
      await changePassword(currentPassword, password)
      setSuccess(true)
      setCurrentPassword("")
      setPassword("")
      setConfirmPassword("")
      setErrors({})
      toast.success("Password changed successfully")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      if (message.includes("incorrect") || message.includes("Invalid login credentials")) {
        setErrors({ currentPassword: "Current password is incorrect" })
      } else {
        setErrors({ form: message })
      }
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const strengthScore = getPasswordStrength(password)
  const strength = getStrengthLabel(strengthScore)

  return (
    <DashboardShell title="Security">
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
          <p className="text-sm text-muted-foreground">Manage your password and security settings.</p>
        </div>

        <EnhancedCard>
          <div className="flex items-center gap-3 pb-4 border-b mb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10">
              <ShieldCheck className="size-5 text-brand" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
              <p className="text-xs text-muted-foreground">Update your password to keep your account secure.</p>
            </div>
          </div>

          {success && (
            <div
              role="status"
              className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle className="size-4" />
              Password changed successfully.
            </div>
          )}

          {errors.form && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-foreground">
                Current password
              </label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  aria-invalid={!!errors.currentPassword}
                  aria-describedby={errors.currentPassword ? "current-password-error" : undefined}
                  placeholder="Enter current password"
                  className="pr-10"
                  maxLength={128}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p id="current-password-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                  New password
                </label>
                {password.length > 0 && (
                  <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "new-password-error" : undefined}
                  placeholder="New password"
                  className="pr-10"
                  maxLength={72}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p id="new-password-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.password}
                </p>
              ) : (
                <ul className="mt-1.5 space-y-0.5">
                  {PASSWORD_REQUIREMENTS.map((req) => {
                    const met = req.test(password)
                    return (
                      <li
                        key={req.label}
                        className={`text-xs ${met ? "text-emerald-500" : "text-muted-foreground"}`}
                      >
                        {met ? "\u2713" : "\u25CB"} {req.label}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-medium text-foreground">
                Confirm new password
              </label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirm-new-password-error" : undefined}
                  placeholder="Confirm new password"
                  className="pr-10"
                  maxLength={72}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-new-password-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading} variant="brand">
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Changing password..." : "Change password"}
              </Button>
            </div>
          </form>
        </EnhancedCard>
      </div>
    </DashboardShell>
  )
}
