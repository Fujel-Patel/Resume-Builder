"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { resetPassword, logout } from "@/lib/api/auth"
import { resetPasswordSchema } from "@/schemas/auth"

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

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const result = resetPasswordSchema.safeParse({ password, confirmPassword })
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
    if (!validate()) return
    setLoading(true)
    try {
      await resetPassword(password)
      await logout()
      toast.success("Password updated successfully. Please sign in with your new password.")
      router.push("/login")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setErrors({ form: message })
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const strengthScore = getPasswordStrength(password)
  const strength = getStrengthLabel(strengthScore)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center lg:text-left">
        <h1 className="text-xl font-semibold text-foreground">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Must be at least 8 characters with uppercase, lowercase, digit, and special character
        </p>
      </div>

      {errors.form && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errors.form}
        </div>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="reset-password" className="text-sm font-medium text-foreground">
            New password
          </label>
          {password.length > 0 && (
            <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
          )}
        </div>
        <div className="relative">
          <Input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "reset-password-error" : undefined}
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
          <p id="reset-password-error" className="mt-1 text-xs text-destructive" role="alert">
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
        <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-medium text-foreground">
          Confirm new password
        </label>
        <div className="relative">
          <Input
            id="reset-confirm"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "reset-confirm-error" : undefined}
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
          <p id="reset-confirm-error" className="mt-1 text-xs text-destructive" role="alert">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <Button type="submit" disabled={loading} variant="brand" className="w-full h-10">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? "Resetting..." : "Reset password"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-brand hover:underline">
          Need a new reset link?
        </Link>
      </p>
    </form>
  )
}
