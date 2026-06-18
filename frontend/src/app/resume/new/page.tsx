import { AuthGuard } from "@/components/auth/auth-guard"
import { ResumeBuilder } from "./resume-builder"

export default function NewResumePage() {
  return (
    <AuthGuard>
      <ResumeBuilder />
    </AuthGuard>
  )
}
