import { Suspense } from "react"
import type { Metadata } from "next"

import { AuthForm } from "@/components/auth/auth-form"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Bloom Factory account.",
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Log in to price your products and manage your library.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  )
}
