import { Suspense } from "react"
import { AuthLayout } from "@/features/auth/auth-layout"
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll help you get back into your account"
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
