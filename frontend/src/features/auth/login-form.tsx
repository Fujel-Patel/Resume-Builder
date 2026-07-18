"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { login, clearError, type AuthError } from "@/lib/features/auth/authSlice"

function getLoginErrorMessage(error: AuthError | string | null): string | null {
  if (!error) return null
  if (typeof error === "string") return error
  const { code, message } = error
  if (code === "INVALID_CREDENTIALS") return "Incorrect email or password. Please try again."
  if (code === "USER_NOT_FOUND") return "No account found with this email address."
  if (code === "ACCOUNT_LOCKED") return message
  if (code === "EMAIL_NOT_VERIFIED") return message || "Please verify your email before signing in."
  if (code === "ACCOUNT_PENDING") return message || "Your account is pending email verification."
  if (code === "RATE_LIMIT_EXCEEDED") return "Too many requests. Please wait a moment and try again."
  if (code === "VALIDATION_ERROR") return "Please check your input and try again."
  if (code === "CONFLICT") return "An account with this email already exists."
  if (code === "UNKNOWN_ERROR" && !message) return "Something went wrong. Please try again."
  return message
}

export function LoginForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error, user } = useAppSelector((s) => s.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) router.push("/dashboard")
  }, [user, router])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (!error) return
    console.debug("[login-form] auth error:", JSON.stringify(error))
    const msg = getLoginErrorMessage(error)
    if (msg) toast.error(msg)
  }, [error])

  const validate = () => {
    const errs: Record<string, string> = {}
    const sanitizedEmail = email.trim()
    if (!sanitizedEmail) {
      errs.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      errs.email = "Invalid email address"
    }
    if (!password) errs.password = "Password is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    dispatch(login({ email: email.trim(), password }))
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
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
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
