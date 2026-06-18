import { AuthGuard } from "@/components/auth/auth-guard"
import { AiSettingsPage } from "./ai-settings"

export default function SettingsPage() {
  return (
    <AuthGuard>
      <AiSettingsPage />
    </AuthGuard>
  )
}
