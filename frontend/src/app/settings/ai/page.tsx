import { AuthGuard } from "@/components/auth/auth-guard"
import dynamic from "next/dynamic"

const AiSettingsPage = dynamic(
  () => import("./ai-settings").then((m) => m.AiSettingsPage),
  {
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    ),
  },
)

export default function SettingsPage() {
  return (
    <AuthGuard>
      <AiSettingsPage />
    </AuthGuard>
  )
}
