"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { resetPassword, logout } from "@/lib/api/auth"
import { ApiRequestError } from "@/lib/api/client"

const PASSWORD_SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;]/

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One digit", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => PASSWORD_SPECIAL_CHARS.test(p) },
] as const

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!password) {
      errs.password = "Password is required"
    } else if (password.length < 8) {
      errs.password = "Must be at least 8 characters"
    } else if (!/[A-Z]/.test(password)) {
      errs.password = "Must contain an uppercase letter"
    } else if (!/[a-z]/.test(password)) {
      errs.password = "Must contain a lowercase letter"
    } else if (!/\d/.test(password)) {
      errs.password = "Must contain a digit"
    } else if (!PASSWORD_SPECIAL_CHARS.test(password)) {
      errs.password = "Must contain a special character"
    }

    if (!confirmPassword) errs.confirmPassword = "Please confirm your password"
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match"

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validate()) return
    setLoading(true)
    try {
      await resetPassword(password)
      await logout()
      toast.success("Password updated. Please log in.")
      router.push("/login")
    } catch (err: unknown) {
      const msg = err instanceof ApiRequestError ? err.message : "Something went wrong"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center lg:text-left">
        <h1 className="text-xl font-semibold text-foreground">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Must be at least 8 characters with uppercase, lowercase, digit, and special character
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium text-foreground">
          New password
        </label>
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
            {showPassword ? "Hide" : "Show"}
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
                  {met ? "✓" : "○"} {req.label}
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
            {showConfirm ? "Hide" : "Show"}
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
