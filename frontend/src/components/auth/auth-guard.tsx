"use client"

import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { ShieldAlert, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnhancedCard } from "@/components/ui/enhanced-card"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAppSelector((s) => s.auth)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EnhancedCard hover={false} className="max-w-sm w-full text-center py-10">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="size-7 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Unauthorized Access</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You need to be logged in to access this page.
          </p>
          <Button variant="brand" onClick={() => router.push("/login")}>
            <LogIn className="size-4" />
            Go to Login
          </Button>
        </EnhancedCard>
      </div>
    )
  }

  return <>{children}</>
}
