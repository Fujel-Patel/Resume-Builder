"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { resendVerification } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"

function VerifyEmailSentContent() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""

  const [email, setEmail] = useState(emailParam)
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState("")
  const [cooldown, setCooldown] = useState(0)

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
      setCooldown(60)
    } catch (err: unknown) {
      setStatus("idle")
      if (err && typeof err === "object" && "code" in err) {
        const e = err as { code: string; message?: string }
        if (e.code === "TOO_MANY_RESEND_ATTEMPTS") {
          setError("Too many requests. Please try again later.")
        } else if (e.code === "RESEND_COOLDOWN") {
          setError(e.message || "Please wait before requesting another email.")
        } else {
          setError(e.message || "Failed to send email. Please try again.")
        }
      } else {
        setError("Failed to send email. Please try again.")
      }
    }
  }, [email, cooldown])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand/10">
            <Mail className="size-7 text-brand" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Check your email</h1>
          {emailParam ? (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a verification link to
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{emailParam}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email to resend the verification link
            </p>
          )}
        </div>

        <div className="space-y-3">
          {status !== "sent" && (
            <p className="text-center text-sm text-muted-foreground">
              Click the link in the email to verify your account. The link expires in 15 minutes.
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam/junk folder.
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
              Verification email sent!
            </div>
          )}

          {!emailParam && status !== "sent" && (
            <div>
              <label htmlFor="resend-email" className="mb-1.5 block text-sm font-medium text-foreground">
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
            disabled={cooldown > 0 || status === "sending" || (!emailParam && !email.trim())}
            variant="outline"
            className="w-full"
          >
            {status === "sending" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Resend verification email"
            )}
            {cooldown > 0 && ` (${cooldown}s)`}
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
