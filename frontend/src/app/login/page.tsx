import { AuthLayout } from "@/features/auth/auth-layout"
import { LoginForm } from "@/features/auth/login-form"

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue building your resume"
    >
      <LoginForm />
    </AuthLayout>
  )
}
