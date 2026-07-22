"use client"

/**
 * Legacy route — kept only so old bookmarks don't 404.
 *
 * Verification MUST complete at /auth/callback.
 * This page never exchanges codes; it redirects users to the correct place.
 */

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

function VerifyEmailRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const tokenHash = searchParams.get("token_hash")
    const type = searchParams.get("type") ?? "signup"
    const email = searchParams.get("email")

    // If a verification payload landed here (old email template), forward
    // it to the real callback so exchange/verify still runs.
    if (code || tokenHash) {
      const params = new URLSearchParams()
      if (code) params.set("code", code)
      if (tokenHash) params.set("token_hash", tokenHash)
      params.set("type", type)
      params.set("next", "/dashboard")
      router.replace(`/auth/callback?${params.toString()}`)
      return
    }

    // No credentials — send to the "check inbox" page
    const dest = email
      ? `/verify-email-sent?email=${encodeURIComponent(email)}`
      : "/verify-email-sent"
    router.replace(dest)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-4">
      <Loader2 className="size-8 animate-spin text-brand" />
      <p className="text-sm text-muted-foreground">Redirecting…</p>
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
      <VerifyEmailRedirect />
    </Suspense>
  )
}
