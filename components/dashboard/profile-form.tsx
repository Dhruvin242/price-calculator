"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { updateProfile } from "@/lib/actions"
import type { ProfileRow } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CURRENCIES = [
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
]

export function ProfileForm({ profile, email }: { profile: ProfileRow | null; email: string }) {
  const router = useRouter()
  const [fullName, setFullName] = React.useState(profile?.full_name ?? "")
  const [businessName, setBusinessName] = React.useState(profile?.business_name ?? "")
  const [currency, setCurrency] = React.useState(profile?.currency ?? "INR")
  const [saving, startSaving] = React.useTransition()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    startSaving(async () => {
      const res = await updateProfile({
        full_name: fullName,
        business_name: businessName,
        currency,
      })
      if (res.ok) {
        toast.success("Profile updated")
        router.refresh()
      } else {
        toast.error(res.error ?? "Could not update profile")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            value={fullName}
            placeholder="Priya Nair"
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="business-name">Business name</Label>
          <Input
            id="business-name"
            value={businessName}
            placeholder="Marigold Market"
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled readOnly />
          <p className="text-xs text-muted-foreground">Email can’t be changed here.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Default currency</Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v as string)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  )
}
