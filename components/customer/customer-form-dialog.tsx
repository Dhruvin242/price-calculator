"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { saveCustomer } from "@/lib/actions"
import type { CustomerRow } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CustomerFormDialog({
  customer,
  trigger,
  onSaved,
}: {
  customer?: CustomerRow
  trigger: React.ReactElement
  /** Called with the new/updated customer id after a successful save. */
  onSaved?: (id: string) => void
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [saving, startSaving] = React.useTransition()

  const [name, setName] = React.useState(customer?.name ?? "")
  const [email, setEmail] = React.useState(customer?.email ?? "")
  const [phone, setPhone] = React.useState(customer?.phone ?? "")
  const [address, setAddress] = React.useState(customer?.billing_address ?? "")
  const [notes, setNotes] = React.useState(customer?.notes ?? "")

  function reset() {
    setName(customer?.name ?? "")
    setEmail(customer?.email ?? "")
    setPhone(customer?.phone ?? "")
    setAddress(customer?.billing_address ?? "")
    setNotes(customer?.notes ?? "")
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Give your customer a name.")
      return
    }
    startSaving(async () => {
      const res = await saveCustomer({
        id: customer?.id,
        name,
        email: email || null,
        phone: phone || null,
        billing_address: address || null,
        notes: notes || null,
      })
      if (!res.ok) {
        toast.error(res.error ?? "Could not save customer")
        return
      }
      toast.success(customer ? "Customer updated" : "Customer added")
      setOpen(false)
      if (res.id) onSaved?.(res.id)
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) reset()
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit customer" : "New customer"}</DialogTitle>
          <DialogDescription>
            Billing details are snapshotted onto each invoice you create for this customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-name">Name</Label>
            <Input
              id="customer-name"
              placeholder="Rose &amp; Thistle Boutique"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-address">Billing address</Label>
            <Textarea
              id="customer-address"
              placeholder="Street, city, state, PIN"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-notes">Notes</Label>
            <Textarea
              id="customer-notes"
              placeholder="Anything worth remembering about this customer…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {customer ? "Save changes" : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
