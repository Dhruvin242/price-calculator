"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <Alert>
        <AlertTitle>Check your inbox</AlertTitle>
        <AlertDescription>
          If an account exists for <strong>{email}</strong>, we’ve sent a link to reset your
          password.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
          value={email}
          aria-invalid={!!error}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Send reset link
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </form>
  )
}
