import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardHome } from "./dashboard-home"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardHome />
    </AuthGuard>
  )
}
