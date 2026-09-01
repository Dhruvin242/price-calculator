import { Suspense } from "react"
import type { Metadata } from "next"

import { AuthForm } from "@/components/auth/auth-form"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Create your account",
  description: "Start pricing your handmade products with Bloom Factory — free forever.",
}

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Start pricing for profit
        </h1>
        <p className="text-sm text-muted-foreground">
          Create your free account. No credit card required.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-72 w-full rounded-2xl" />}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  )
}
