import { AuthGuard } from "@/components/auth/auth-guard"
import { ResumePage } from "./resume-page"

export default function MyResumesPage() {
  return (
    <AuthGuard>
      <ResumePage />
    </AuthGuard>
  )
}
