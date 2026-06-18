import { Suspense } from "react"
import { AuthLayout } from "@/features/auth/auth-layout"
import { ResetPasswordForm } from "@/features/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your new password"
    >
      <Suspense fallback={<div className="text-center text-sm text-muted-foreground py-8">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
