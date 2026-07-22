"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { forgotPassword } from "@/lib/api/auth"
import { forgotPasswordSchema } from "@/schemas/auth"
import { normalizeAuthError } from "@/lib/auth/errors"

export function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (searchParams.get("error") === "link_invalid") {
      setError("That reset link is invalid or has expired. Request a new one below.")
    }
  }, [searchParams])

  const validate = (): string | null => {
    const result = forgotPasswordSchema.safeParse({ email })
    if (result.success) return null
    return result.error.issues[0]?.message ?? "Invalid email address"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }
    setLoading(true)
    try {
      await forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch (err: unknown) {
      const normalized = normalizeAuthError(err)

      if (normalized.code === "RATE_LIMIT_EXCEEDED") {
        setError(normalized.message)
        toast.error(normalized.message)
        setLoading(false)
        return
      }

      // Anti-enumeration: always show success for other errors
      // (including "user not found") so attackers can't probe emails.
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    const maskedEmail = email.trim().toLowerCase()
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="size-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists with <strong className="text-foreground">{maskedEmail}</strong>,
            a password reset link has been sent.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The link expires in about 1 hour. Check spam/junk if you don&apos;t see it.
            The link will open the secure reset page after verification.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center lg:text-left">
        <h1 className="text-xl font-semibold text-foreground">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-start gap-2"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={255}
          autoComplete="email"
        />
      </div>

      <Button type="submit" disabled={loading} variant="brand" className="w-full h-10">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-brand hover:underline">
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
