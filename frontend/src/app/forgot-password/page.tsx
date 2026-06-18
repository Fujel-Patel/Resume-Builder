import { AuthLayout } from "@/features/auth/auth-layout"
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll send you a reset link"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
