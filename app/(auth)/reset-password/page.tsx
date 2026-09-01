import type { Metadata } from "next"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Bloom Factory account.",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Set a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password you’ll remember.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  )
}
