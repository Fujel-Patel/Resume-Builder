"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { resetPasswordApi } from "@/lib/api/auth"
import { ApiRequestError } from "@/lib/api/client"

const PASSWORD_REQUIREMENTS = [
  "At least 8 characters",
  "One uppercase letter",
  "One lowercase letter",
  "One digit",
  "One special character",
] as const

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!password) errs.password = "Password is required"
    else if (password.length < 8) errs.password = "Must be at least 8 characters"
    else if (!/[A-Z]/.test(password)) errs.password = "Must contain an uppercase letter"
    else if (!/[a-z]/.test(password)) errs.password = "Must contain a lowercase letter"
    else if (!/\d/.test(password)) errs.password = "Must contain a digit"
    else if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;]/.test(password))
      errs.password = "Must contain a special character"

    if (!confirmPassword) errs.confirmPassword = "Please confirm your password"
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validate()) return
    if (!token) {
      setError("Missing reset token")
      toast.error("Missing reset token. Please request a new link.")
      return
    }
    setLoading(true)
    try {
      await resetPasswordApi(token, password)
      setDone(true)
      toast.success("Password reset successfully!")
    } catch (e) {
      const msg = e instanceof ApiRequestError ? e.message : "Something went wrong"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Invalid or missing reset link. Please request a new one.
        </div>
        <Link
          href="/forgot-password"
          className="inline-block text-sm text-brand hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="size-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Password reset</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been updated successfully.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-black hover:bg-brand-dark"
        >
          Sign in with new password
        </Link>
      </div>
    )
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
        <Input
          id="reset-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          placeholder="New password"
        />
        {errors.password ? (
          <p id="reset-password-error" className="mt-1 text-xs text-destructive" role="alert">
            {errors.password}
          </p>
        ) : (
          <ul className="mt-1.5 space-y-0.5">
            {PASSWORD_REQUIREMENTS.map((req) => {
              const met =
                req === "At least 8 characters"
                  ? password.length >= 8
                  : req === "One uppercase letter"
                    ? /[A-Z]/.test(password)
                    : req === "One lowercase letter"
                      ? /[a-z]/.test(password)
                      : req === "One digit"
                        ? /\d/.test(password)
                        : req === "One special character"
                          ? /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;]/.test(password)
                          : false
              return (
                <li
                  key={req}
                  className={`text-xs ${met ? "text-emerald-500" : "text-muted-foreground"}`}
                >
                  {met ? "✓" : "○"} {req}
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
        <Input
          id="reset-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-invalid={!!errors.confirmPassword}
          placeholder="Confirm new password"
        />
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
    </form>
  )
}
