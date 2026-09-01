"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { saveStall } from "@/lib/actions"
import type { StallRow } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { NumberInput } from "@/components/calculator/number-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function StallFormDialog({
  stall,
  trigger,
}: {
  stall?: StallRow
  trigger: React.ReactElement
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [saving, startSaving] = React.useTransition()

  const [name, setName] = React.useState(stall?.name ?? "")
  const [eventDate, setEventDate] = React.useState(stall?.event_date ?? "")
  const [location, setLocation] = React.useState(stall?.location ?? "")
  const [rent, setRent] = React.useState(stall?.rent ?? 0)
  const [otherExpenses, setOtherExpenses] = React.useState(stall?.other_expenses ?? 0)
  const [notes, setNotes] = React.useState(stall?.notes ?? "")

  function reset() {
    setName(stall?.name ?? "")
    setEventDate(stall?.event_date ?? "")
    setLocation(stall?.location ?? "")
    setRent(stall?.rent ?? 0)
    setOtherExpenses(stall?.other_expenses ?? 0)
    setNotes(stall?.notes ?? "")
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Give your stall a name.")
      return
    }
    startSaving(async () => {
      const res = await saveStall({
        id: stall?.id,
        name,
        event_date: eventDate || null,
        location: location || null,
        rent,
        other_expenses: otherExpenses,
        notes: notes || null,
      })
      if (!res.ok) {
        toast.error(res.error ?? "Could not save stall")
        return
      }
      toast.success(stall ? "Stall updated" : "Stall created")
      setOpen(false)
      if (!stall && res.id) {
        router.push(`/dashboard/stalls/${res.id}`)
      } else {
        router.refresh()
      }
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
          <DialogTitle>{stall ? "Edit stall" : "New live stall"}</DialogTitle>
          <DialogDescription>
            Set up the event and its fixed costs. You’ll record sales inside the stall.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stall-name">Stall name</Label>
            <Input
              id="stall-name"
              placeholder="Sunday Farmers Market"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stall-date">Date</Label>
              <DatePicker
                id="stall-date"
                value={eventDate || null}
                onChange={(next) => setEventDate(next ?? "")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stall-location">Location</Label>
              <Input
                id="stall-location"
                placeholder="City Square"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Stall rent</Label>
              <NumberInput value={rent} onValueChange={setRent} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Other fixed expenses</Label>
              <NumberInput value={otherExpenses} onValueChange={setOtherExpenses} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stall-notes">Notes</Label>
            <Textarea
              id="stall-notes"
              placeholder="Table number, setup time, anything worth remembering…"
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
              {stall ? "Save changes" : "Create stall"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
