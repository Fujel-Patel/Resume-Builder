"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { resendVerification } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react"

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [resendError, setResendError] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = useCallback(async () => {
    if (!userEmail || cooldown > 0) return
    setResendStatus("sending")
    setResendError("")
    try {
      await resendVerification(userEmail)
      setResendStatus("sent")
      setCooldown(60)
    } catch (err: unknown) {
      setResendStatus("idle")
      if (err && typeof err === "object" && "code" in err) {
        const e = err as { code: string; message?: string }
        setResendError(e.message || "Failed to send email. Please try again.")
      } else {
        setResendError("Failed to send email. Please try again.")
      }
    }
  }, [userEmail, cooldown])

  useEffect(() => {
    let cancelled = false

    async function checkSession() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (cancelled) return

      if (session?.user?.email_confirmed_at) {
        setUserEmail(session.user.email ?? "")
        setStatus("success")
        setMessage("Email verified successfully!")
      } else if (session?.user) {
        // Session exists but email not confirmed — shouldn't happen after PKCE exchange
        setUserEmail(session.user.email ?? "")
        setStatus("error")
        setMessage("Email verification is pending. Please check your inbox.")
      } else {
        setStatus("error")
        setMessage("Invalid or expired verification link. Please resend the verification email.")
      }
    }

    checkSession()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-brand" />
            <h1 className="text-lg font-semibold text-foreground">Verifying your email...</h1>
            <p className="text-sm text-muted-foreground">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="size-7 text-emerald-500" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Email verified!</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Link href="/dashboard">
              <Button variant="brand" className="w-full">Go to Dashboard</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-7 text-destructive" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Verification needed</h1>
            <p className="text-sm text-muted-foreground">{message}</p>

            {resendError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {resendError}
              </div>
            )}

            {resendStatus === "sent" && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 justify-center"
              >
                <Mail className="size-4" />
                Verification email sent!
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleResend}
                disabled={cooldown > 0 || resendStatus === "sending" || !userEmail}
                variant="brand"
                className="w-full"
              >
                {resendStatus === "sending" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Resend verification email"
                )}
                {cooldown > 0 && ` (${cooldown}s)`}
              </Button>
              <Link href="/login">
                <Button variant="outline" className="w-full">Back to Login</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
