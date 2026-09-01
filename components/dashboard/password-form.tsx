"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PasswordForm() {
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Password updated")
    setPassword("")
    setConfirm("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </div>
    </form>
  )
}
