"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function SignupForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState("")

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = "Full name is required"
    if (!email) errs.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email address"
    if (!password) errs.password = "Password is required"
    else if (password.length < 8) errs.password = "Must be at least 8 characters"
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password"
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match"
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
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="text-center lg:text-left">
        <h1 className="text-xl font-semibold text-foreground">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in your details to get started
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
        <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-foreground">
          Full Name
        </label>
        <Input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "signup-name-error" : undefined}
          placeholder="John Doe"
        />
        {errors.name && (
          <p id="signup-name-error" className="mt-1 text-xs text-destructive" role="alert">
            {errors.name}
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
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p id="signup-email-error" className="mt-1 text-xs text-destructive" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "signup-password-error" : undefined}
          placeholder="At least 8 characters"
        />
        {errors.password ? (
          <p id="signup-password-error" className="mt-1 text-xs text-destructive" role="alert">
            {errors.password}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
        )}
      </div>

      <div>
        <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <Input
          id="signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined}
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p id="signup-confirm-error" className="mt-1 text-xs text-destructive" role="alert">
            {errors.confirmPassword}
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
