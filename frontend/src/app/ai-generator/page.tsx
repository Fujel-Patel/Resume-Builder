import { AuthGuard } from "@/components/auth/auth-guard"
import { AiGeneratorPage } from "./ai-generator"

export default function GeneratorPage() {
  return (
    <AuthGuard>
      <AiGeneratorPage />
    </AuthGuard>
  )
}
