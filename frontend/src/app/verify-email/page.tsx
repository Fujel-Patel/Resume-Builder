"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { resendVerification } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react"

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already_verified">("loading")
  const [message, setMessage] = useState("")
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [resendError, setResendError] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [verifiedEmail, setVerifiedEmail] = useState("")

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = useCallback(async () => {
    if (!verifiedEmail || cooldown > 0) return
    setResendStatus("sending")
    setResendError("")
    try {
      await resendVerification(verifiedEmail)
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
  }, [verifiedEmail, cooldown])

  useEffect(() => {
    let cancelled = false

    async function handleVerification() {
      const supabase = createClient()
      const url = new URL(window.location.href)

      // Method 1: PKCE code flow (?code=...)
      const code = url.searchParams.get("code")
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled) {
          if (error) {
            if (error.message?.includes("already") || error.message?.includes("Email already confirmed")) {
              setStatus("already_verified")
            } else {
              setStatus("error")
              setMessage("Invalid or expired verification link.")
            }
          } else {
            setVerifiedEmail(data.user?.email ?? "")
            setStatus("success")
            setMessage("Email verified successfully!")
          }
        }
        return
      }

      // Method 2: Hash fragment tokens (#access_token=...&refresh_token=...)
      const hash = window.location.hash
      if (hash && hash.length > 1) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get("access_token")
        const refreshToken = params.get("refresh_token")

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (!cancelled) {
            if (error) {
              if (error.message?.includes("already") || error.message?.includes("Email already confirmed")) {
                setStatus("already_verified")
              } else {
                setStatus("error")
                setMessage("Invalid or expired verification link.")
              }
            } else {
              setVerifiedEmail(data.user?.email ?? "")
              setStatus("success")
              setMessage("Email verified successfully!")
            }
          }
          return
        }
      }

      // Method 3: Check if user already has a session (might have verified via another tab)
      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelled) {
        if (session?.user?.email_confirmed_at) {
          setVerifiedEmail(session.user.email ?? "")
          setStatus("success")
          setMessage("Email verified successfully!")
        } else {
          setStatus("error")
          setMessage("No verification token found. Please click the link in your email again.")
        }
      }
    }

    handleVerification()
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

        {status === "already_verified" && (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="size-7 text-emerald-500" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Already verified</h1>
            <p className="text-sm text-muted-foreground">
              Your email has already been verified. Please sign in.
            </p>
            <Link href="/login">
              <Button variant="brand" className="w-full">Go to Login</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-7 text-destructive" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Verification failed</h1>
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
                disabled={cooldown > 0 || resendStatus === "sending"}
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
