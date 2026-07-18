"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    let cancelled = false

    async function handleVerification() {
      const hash = window.location.hash
      if (!hash) {
        if (!cancelled) {
          setStatus("error")
          setMessage("No verification token provided.")
        }
        return
      }

      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")

      if (!accessToken || !refreshToken) {
        if (!cancelled) {
          setStatus("error")
          setMessage("Invalid verification link.")
        }
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (!cancelled) {
        if (error) {
          setStatus("error")
          setMessage("Invalid or expired verification link.")
        } else {
          setStatus("success")
          setMessage("Email verified successfully!")
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

        {status === "error" && (
          <>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-7 text-destructive" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Verification failed</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <div className="space-y-2">
              <Link href="/login">
                <Button variant="brand" className="w-full">Back to Login</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="w-full">Create a New Account</Button>
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
