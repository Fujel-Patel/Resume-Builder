"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState("")

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!email) errs.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email address"
    if (!password) errs.password = "Password is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setGeneralError("Invalid email or password")
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center lg:text-left">
        <h1 className="text-xl font-semibold text-foreground">Sign In</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to continue
        </p>
      </div>

      {generalError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {generalError}
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
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p id="login-email-error" className="mt-1 text-xs text-destructive" role="alert">
            {errors.email}
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
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          placeholder="Enter your password"
        />
        {errors.password && (
          <p id="login-password-error" className="mt-1 text-xs text-destructive" role="alert">
            {errors.password}
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
