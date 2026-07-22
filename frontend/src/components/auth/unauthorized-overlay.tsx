"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { resetAuth } from "@/lib/features/auth/authSlice"
import { logout as logoutSupabase } from "@/lib/api/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

export function UnauthorizedOverlay() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    const handler = () => {
      dispatch(resetAuth())
      // Best-effort sign-out so stale cookies don't bounce the user back
      void logoutSupabase().catch(() => {})
      setOpen(true)
    }
    window.addEventListener("auth:unauthorized", handler)
    return () => window.removeEventListener("auth:unauthorized", handler)
  }, [dispatch])

  const handleLogin = () => {
    setOpen(false)
    router.push("/login")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired. Please log in again to continue using your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="brand" onClick={handleLogin}>
            <LogIn className="size-4" />
            Go to Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
