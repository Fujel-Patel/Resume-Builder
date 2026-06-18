import { AuthGuard } from "@/components/auth/auth-guard"
import { AtsScorePage } from "@/features/ats/ats-score-page"

export default function AtsScore() {
  return (
    <AuthGuard>
      <AtsScorePage />
    </AuthGuard>
  )
}
