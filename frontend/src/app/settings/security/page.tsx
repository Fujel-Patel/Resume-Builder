import { AuthGuard } from "@/components/auth/auth-guard"
import dynamic from "next/dynamic"

const ChangePasswordForm = dynamic(
  () => import("./change-password-form").then((m) => m.ChangePasswordForm),
  {
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    ),
  },
)

export default function SecuritySettingsPage() {
  return (
    <AuthGuard>
      <ChangePasswordForm />
    </AuthGuard>
  )
}
