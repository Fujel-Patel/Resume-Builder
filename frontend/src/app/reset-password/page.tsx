"use client"

import { Suspense, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/features/auth/auth-layout"
import { ResetPasswordForm } from "@/features/auth/reset-password-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"

function ResetPasswordContent() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    let cancelled = false

    async function handleReset() {
      const supabase = createClient()

      // Check if middleware already established a session via PKCE code exchange.
      // When the user clicks the reset link, middleware intercepts the ?code= param,
      // exchanges it for a session server-side, and redirects back here with cookies set.
      const { data: { session } } = await supabase.auth.getSession()

      if (cancelled) return

      if (session) {
        setStatus("ready")
        return
      }

      // Fallback: check hash fragment for implicit flow tokens (legacy Supabase links)
      const hash = window.location.hash
      if (hash && hash.length > 1) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get("access_token")
        const refreshToken = params.get("refresh_token")

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (!cancelled) {
            if (error) {
              setStatus("error")
              setMessage("This reset link has expired or is invalid. Please request a new one.")
            } else {
              setStatus("ready")
            }
          }
          return
        }
      }

      // No session, no tokens — user navigated here directly or link was invalid
      if (!cancelled) {
        setStatus("error")
        setMessage("This reset link has expired or is invalid. Please request a new one.")
      }
    }

    handleReset()
    return () => { cancelled = true }
  }, [])

  if (status === "loading") {
    return (
      <AuthLayout title="Reset password" subtitle="Verifying your link...">
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    )
  }

  if (status === "error") {
    return (
      <AuthLayout title="Reset password" subtitle="Link invalid or expired">
        <div className="space-y-5 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Link href="/forgot-password">
            <Button variant="brand" className="w-full">Request a new link</Button>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-brand hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your new password">
      <Suspense fallback={<div className="text-center text-sm text-muted-foreground py-8">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
