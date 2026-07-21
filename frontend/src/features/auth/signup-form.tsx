"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { signup, clearError, type AuthError } from "@/lib/features/auth/authSlice"

const PASSWORD_SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;]/u

function getSignupErrorMessage(error: AuthError | string | null): string | null {
  if (!error) return null
  if (typeof error === "string") return error
  const { code, message } = error
  if (code === "CONFLICT") return "An account with this email already exists. Please sign in."
  if (code === "VALIDATION_ERROR") return "Please check your input and try again."
  if (code === "RATE_LIMIT_EXCEEDED") return "Too many requests. Please wait a moment and try again."
  if (code === "INVALID_EMAIL") return message
  if (code === "DISPOSABLE_EMAIL") return message
  if (code === "UNKNOWN_ERROR" && !message) return "Something went wrong. Please try again."
  return message
}

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

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One digit", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => PASSWORD_SPECIAL_CHARS.test(p) },
] as const

export function SignupForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error, signupEmail } = useAppSelector((s) => s.auth)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (signupEmail) {
      router.push(`/verify-email-sent?email=${encodeURIComponent(signupEmail)}`)
    }
  }, [signupEmail, router])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (!error) return
    const msg = getSignupErrorMessage(error)
    if (msg) toast.error(msg)
  }, [error])

  const validate = () => {
    const errs: Record<string, string> = {}
    const trimmedName = name.trim()
    if (!trimmedName) {
      errs.name = "Full name is required"
    } else if (trimmedName.length > 255) {
      errs.name = "Name must be under 255 characters"
    }
    const sanitizedEmail = email.trim().toLowerCase()
    if (!sanitizedEmail) {
      errs.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      errs.email = "Invalid email address"
    }
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
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const sanitizedName = name.trim().replace(/<[^>]*>/g, "")
    dispatch(signup({ name: sanitizedName, email: email.trim().toLowerCase(), password }))
  }

  const getFieldError = (field: string): string | undefined => {
    if (errors[field]) return errors[field]
    if (error?.fields?.[field]) return error.fields[field][0]
    return undefined
  }

  const errorMessage = getSignupErrorMessage(error)
  const strengthScore = getPasswordStrength(password)
  const strength = getStrengthLabel(strengthScore)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="text-center lg:text-left">
        <h1 className="text-xl font-semibold text-foreground">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in your details to get started
        </p>
      </div>

      {typeof errorMessage === "string" && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-foreground">
          Full Name
        </label>
        <Input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!getFieldError("name")}
          aria-describedby={getFieldError("name") ? "signup-name-error" : undefined}
          placeholder="John Doe"
          maxLength={255}
        />
        {getFieldError("name") && (
          <p id="signup-name-error" className="mt-1 text-xs text-destructive" role="alert">
            {getFieldError("name")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!getFieldError("email")}
          aria-describedby={getFieldError("email") ? "signup-email-error" : undefined}
          placeholder="you@example.com"
          maxLength={255}
          autoComplete="email"
        />
        {getFieldError("email") && (
          <p id="signup-email-error" className="mt-1 text-xs text-destructive" role="alert">
            {getFieldError("email")}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
            Password
          </label>
          {password.length > 0 && (
            <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
          )}
        </div>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!getFieldError("password")}
            aria-describedby={getFieldError("password") ? "signup-password-error" : undefined}
            placeholder="At least 8 characters"
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
        {getFieldError("password") ? (
          <p id="signup-password-error" className="mt-1 text-xs text-destructive" role="alert">
            {getFieldError("password")}
          </p>
        ) : (
          <ul className="mt-1.5 space-y-0.5">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(password)
              return (
                <li
                  key={rule.label}
                  className={`text-xs ${met ? "text-emerald-500" : "text-muted-foreground"}`}
                >
                  {met ? "✓" : "○"} {rule.label}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="signup-confirm"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!getFieldError("confirmPassword")}
            aria-describedby={getFieldError("confirmPassword") ? "signup-confirm-error" : undefined}
            placeholder="Confirm your password"
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
        {getFieldError("confirmPassword") && (
          <p id="signup-confirm-error" className="mt-1 text-xs text-destructive" role="alert">
            {getFieldError("confirmPassword")}
          </p>
        )}
      </div>

      <Button type="submit" disabled={loading} variant="brand" className="w-full h-10">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
