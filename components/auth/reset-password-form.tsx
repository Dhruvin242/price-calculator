"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [show, setShow] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    toast.success("Password updated. You're all set.")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            className="pr-10"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Update password
      </Button>
    </form>
  )
}
