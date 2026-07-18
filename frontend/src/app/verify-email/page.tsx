"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { verifyEmailApi } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  )
  const [message, setMessage] = useState(
    token ? "" : "No verification token provided. Check your email for the correct link.",
  )

  useEffect(() => {
    if (!token) return

    let cancelled = false
    verifyEmailApi(token)
      .then((res) => {
        if (!cancelled) {
          setStatus("success")
          setMessage(res.message || "Email verified successfully!")
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus("error")
          const msg =
            err instanceof Error
              ? err.message
              : err && typeof err === "object" && "message" in err
                ? (err as { message?: string }).message
                : "Invalid or expired verification link. Please request a new one."
          setMessage(msg || "Invalid or expired verification link. Please request a new one.")
        }
      })

    return () => { cancelled = true }
  }, [token])

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
            <Link href="/login">
              <Button variant="brand" className="w-full">Sign In</Button>
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
