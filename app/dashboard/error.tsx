"use client"

import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </div>
      <div>
        <h2 className="font-heading text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn’t load this page. {error.message || "Please try again."}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
