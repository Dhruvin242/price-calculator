"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteMaterial } from "@/lib/actions"
import { formatCurrency } from "@/lib/pricing"
import type { MaterialRow } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaterialFormDialog } from "@/components/material/material-form-dialog"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function MaterialsGrid({
  materials,
  currency,
}: {
  materials: MaterialRow[]
  currency: string
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [target, setTarget] = React.useState<MaterialRow | null>(null)
  const [search, setSearch] = React.useState("")

  const visible = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return materials
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (m.supplier ?? "").toLowerCase().includes(term)
    )
  }, [materials, search])

  function handleDelete() {
    if (!target) return
    const id = target.id
    startTransition(async () => {
      const res = await deleteMaterial(id)
      if (res.ok) {
        toast.success("Material deleted")
        setTarget(null)
        router.refresh()
      } else {
        toast.error(res.error ?? "Could not delete material")
      }
    })
  }

  return (
    <>
      <Input
        placeholder="Search materials or suppliers…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-xs"
      />

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No material matches “{search}”.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
          {visible.map((material) => {
            const unitCost =
              material.units_per_package > 0
                ? material.package_cost / material.units_per_package
                : 0

            return (
              <Card
                key={material.id}
                title={material.notes ?? undefined}
                className="group flex-row items-center gap-2.5 p-3 sm:gap-3 sm:p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading text-sm font-semibold">
                    {material.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    <span className="tabular-nums">
                      {formatCurrency(material.package_cost, currency)} /{" "}
                      {material.units_per_package} {material.unit}
                    </span>
                    {material.supplier && <> &middot; {material.supplier}</>}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {formatCurrency(unitCost, currency)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">per {material.unit}</div>
                </div>

                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100">
                  <MaterialFormDialog
                    material={material}
                    currency={currency}
                    trigger={
                      <Button variant="ghost" size="icon-xs" aria-label="Edit material">
                        <Pencil className="size-3.5" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Delete material"
                    onClick={() => setTarget(material)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this material?</DialogTitle>
            <DialogDescription>
              “{target?.name}” will be removed from your library. Products priced with
              it keep their current costs, but they will no longer follow price changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              Delete material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
