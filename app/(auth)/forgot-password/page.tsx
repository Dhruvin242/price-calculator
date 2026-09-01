import type { Metadata } from "next"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a link to reset your Bloom Factory password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we’ll send you a link to reset it.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
