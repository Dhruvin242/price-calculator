"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { saveMaterial } from "@/lib/actions"
import { formatCurrency } from "@/lib/pricing"
import { MATERIAL_UNITS, type MaterialRow } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NumberInput } from "@/components/calculator/number-input"

export function MaterialFormDialog({
  material,
  currency = "INR",
  trigger,
  onSaved,
}: {
  material?: MaterialRow
  currency?: string
  trigger: React.ReactElement
  /** Called with the new/updated material id after a successful save. */
  onSaved?: (id: string) => void
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [saving, startSaving] = React.useTransition()

  const [name, setName] = React.useState(material?.name ?? "")
  const [unit, setUnit] = React.useState<string>(material?.unit ?? "piece")
  const [packageCost, setPackageCost] = React.useState(material?.package_cost ?? 0)
  const [unitsPerPackage, setUnitsPerPackage] = React.useState(
    material?.units_per_package ?? 1
  )
  const [supplier, setSupplier] = React.useState(material?.supplier ?? "")
  const [notes, setNotes] = React.useState(material?.notes ?? "")

  const unitCost = unitsPerPackage > 0 ? packageCost / unitsPerPackage : 0

  function reset() {
    setName(material?.name ?? "")
    setUnit(material?.unit ?? "piece")
    setPackageCost(material?.package_cost ?? 0)
    setUnitsPerPackage(material?.units_per_package ?? 1)
    setSupplier(material?.supplier ?? "")
    setNotes(material?.notes ?? "")
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Give your material a name.")
      return
    }
    if (!(unitsPerPackage > 0)) {
      toast.error("Units per pack must be greater than zero.")
      return
    }
    startSaving(async () => {
      const res = await saveMaterial({
        id: material?.id,
        name,
        unit,
        package_cost: packageCost,
        units_per_package: unitsPerPackage,
        supplier: supplier || null,
        notes: notes || null,
      })
      if (!res.ok) {
        toast.error(res.error ?? "Could not save material")
        return
      }
      toast.success(material ? "Material updated" : "Material added")
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
          <DialogTitle>{material ? "Edit material" : "New material"}</DialogTitle>
          <DialogDescription>
            Enter what a pack costs and how many units it holds. The calculator picks
            this up so you never retype a price.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="material-name">Material name</Label>
              <Input
                id="material-name"
                placeholder="Preserved roses"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Pack price</Label>
              <NumberInput
                className="text-right"
                value={packageCost}
                onValueChange={setPackageCost}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Units per pack</Label>
              <NumberInput
                className="text-right"
                min={0}
                value={unitsPerPackage}
                onValueChange={setUnitsPerPackage}
              />
            </div>
          </div>

          <p className="rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            Cost per {unit}:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {formatCurrency(unitCost, currency)}
            </span>
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="material-supplier">Supplier</Label>
            <Input
              id="material-supplier"
              placeholder="Where you buy it"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="material-notes">Notes</Label>
            <Textarea
              id="material-notes"
              placeholder="Colour, grade, minimum order…"
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
              {material ? "Save changes" : "Add material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
