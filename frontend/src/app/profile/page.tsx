import { AuthGuard } from "@/components/auth/auth-guard"
import { ProfilePage } from "./profile-page"

export default function Profile() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  )
}
