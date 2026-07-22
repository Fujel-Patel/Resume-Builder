"use client"

/**
 * "Check your inbox" page — NOT an auth callback.
 *
 * Users land here after signup or when trying to access the app unverified.
 * Verification links must go to /auth/callback, never here.
 */

import { Suspense, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { resendVerification } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react"

const COOLDOWN_SECONDS = 60

function VerifyEmailSentContent() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""
  const linkError = searchParams.get("error") === "link_invalid"
  const reason = searchParams.get("reason")

  const [email, setEmail] = useState(emailParam)
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState("")
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    setEmail(emailParam)
  }, [emailParam])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = useCallback(async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || cooldown > 0) return
    setStatus("sending")
    setError("")
    try {
      await resendVerification(trimmed)
      setStatus("sent")
      setCooldown(COOLDOWN_SECONDS)
    } catch (err: unknown) {
      setStatus("idle")
      if (err && typeof err === "object" && "code" in err) {
        const e = err as { code: string; message?: string }
        if (e.code === "RATE_LIMIT_EXCEEDED") {
          setError("Too many requests. Please wait a minute and try again.")
          setCooldown(COOLDOWN_SECONDS)
        } else {
          setError(e.message || "Failed to send email. Please try again.")
        }
      } else if (err instanceof Error) {
        setError(err.message || "Failed to send email. Please try again.")
      } else {
        setError("Failed to send email. Please try again.")
      }
    }
  }, [email, cooldown])

  const title = linkError
    ? "Verification link invalid"
    : reason === "unverified"
      ? "Verify your email"
      : "Check your email"

  const subtitle = linkError
    ? "That verification link is invalid or has expired. Request a new one below."
    : emailParam
      ? "We sent a verification link to"
      : "Enter your email to resend the verification link"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 flex size-14 items-center justify-center rounded-full ${
              linkError ? "bg-destructive/10" : "bg-brand/10"
            }`}
          >
            {linkError ? (
              <AlertCircle className="size-7 text-destructive" />
            ) : (
              <Mail className="size-7 text-brand" />
            )}
          </div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {emailParam && !linkError ? (
            <>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{emailParam}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="space-y-3">
          {status !== "sent" && (
            <p className="text-center text-sm text-muted-foreground">
              Click the link in the email to verify your account. Links expire
              after a short time for security.
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam/junk folder. On free-tier
            Supabase, emails may only reach project team members unless custom
            SMTP is configured.
          </p>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive text-center"
            >
              {error}
            </div>
          )}

          {status === "sent" && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 text-center justify-center"
            >
              <CheckCircle className="size-4" />
              Verification email sent — check your inbox.
            </div>
          )}

          {!emailParam && status !== "sent" && (
            <div>
              <label
                htmlFor="resend-email"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <Input
                id="resend-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
                autoComplete="email"
              />
            </div>
          )}

          <Button
            onClick={handleResend}
            disabled={
              cooldown > 0 ||
              status === "sending" ||
              (!emailParam && !email.trim())
            }
            variant="outline"
            className="w-full"
          >
            {status === "sending" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              "Resend verification email"
            )}
          </Button>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailSentContent />
    </Suspense>
  )
}
