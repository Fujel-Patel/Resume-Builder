import { AuthLayout } from "@/features/auth/auth-layout"
import { SignupForm } from "@/features/auth/signup-form"

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building ATS-friendly resumes with AI"
    >
      <SignupForm />
    </AuthLayout>
  )
}
