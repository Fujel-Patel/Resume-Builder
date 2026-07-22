import { Suspense } from "react"
import { AuthLayout } from "@/features/auth/auth-layout"
import { LoginForm } from "@/features/auth/login-form"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue building your resume"
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
