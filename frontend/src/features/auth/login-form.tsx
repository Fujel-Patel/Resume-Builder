"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2, MailWarning } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { login, clearError, type AuthError } from "@/lib/features/auth/authSlice"
import { loginSchema } from "@/schemas/auth"

function getLoginErrorMessage(error: AuthError | string | null): string | null {
  if (!error) return null
  if (typeof error === "string") return error
  const { code, message } = error
  if (code === "INVALID_CREDENTIALS") return "Incorrect email or password. Please try again."
  if (code === "USER_NOT_FOUND") return "Incorrect email or password. Please try again."
  if (code === "ACCOUNT_LOCKED") return message
  if (code === "EMAIL_NOT_VERIFIED") return "Please verify your email before signing in."
  if (code === "ACCOUNT_PENDING") return "Please verify your email before signing in."
  if (code === "RATE_LIMIT_EXCEEDED") return "Too many requests. Please wait a moment and try again."
  if (code === "VALIDATION_ERROR") return "Please check your input and try again."
  if (code === "UNKNOWN_ERROR" && !message) return "Something went wrong. Please try again."
  return message
}

function needsVerification(error: AuthError | string | null): boolean {
  if (!error || typeof error === "string") return false
  return error.code === "EMAIL_NOT_VERIFIED" || error.code === "ACCOUNT_PENDING"
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { loading, error, user } = useAppSelector((s) => s.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      const from = searchParams.get("from")
      router.push(from && from.startsWith("/") && !from.startsWith("//") ? from : "/dashboard")
    }
  }, [user, router, searchParams])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    const callbackError = searchParams.get("error")
    if (callbackError === "auth_callback_error") {
      toast.error("Authentication failed. Please try signing in again.")
    }
  }, [searchParams])

  useEffect(() => {
    if (!error) return
    const msg = getLoginErrorMessage(error)
    if (msg) toast.error(msg)
  }, [error])

  const validate = (): boolean => {
    const result = loginSchema.safeParse({ email, password })
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
    dispatch(login({ email: email.trim().toLowerCase(), password }))
  }

  const getFieldError = (field: string): string | undefined => {
    const clientErr = errors[field]
    if (typeof clientErr === "string" && clientErr) return clientErr
    if (error && typeof error === "object" && error.fields && Array.isArray(error.fields[field])) {
      return error.fields[field][0]
    }
    return undefined
  }

  const errorMessage = getLoginErrorMessage(error)
  const showResendLink = needsVerification(error) && email.trim()

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center lg:text-left">
        <h1 className="text-xl font-semibold text-foreground">Sign In</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to continue
        </p>
      </div>

      {typeof errorMessage === "string" && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive space-y-2"
        >
          <div className="flex items-start gap-2">
            <MailWarning className="mt-0.5 size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {showResendLink && (
            <Link
              href={`/verify-email-sent?email=${encodeURIComponent(email.trim().toLowerCase())}`}
              className="block text-xs font-medium text-destructive underline underline-offset-2 hover:text-destructive/80"
            >
              Resend verification email
            </Link>
          )}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!getFieldError("email")}
          aria-describedby={getFieldError("email") ? "login-email-error" : undefined}
          placeholder="you@example.com"
          maxLength={255}
          autoComplete="email"
        />
        {getFieldError("email") && (
          <p id="login-email-error" className="mt-1 text-xs text-destructive" role="alert">
            {getFieldError("email")}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-brand transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!getFieldError("password")}
            aria-describedby={getFieldError("password") ? "login-password-error" : undefined}
            placeholder="Enter your password"
            className="pr-10"
            maxLength={128}
            autoComplete="current-password"
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
        {getFieldError("password") && (
          <p id="login-password-error" className="mt-1 text-xs text-destructive" role="alert">
            {getFieldError("password")}
          </p>
        )}
      </div>

      <Button type="submit" disabled={loading} variant="brand" className="w-full h-10">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
