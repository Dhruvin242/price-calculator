import type { Metadata } from "next"
import { Boxes, Plus } from "lucide-react"

import { getMaterials, getProfile } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { MaterialsGrid } from "@/components/material/materials-grid"
import { MaterialFormDialog } from "@/components/material/material-form-dialog"

export const metadata: Metadata = { title: "Materials" }

export default async function MaterialsPage() {
  const [materials, profile] = await Promise.all([getMaterials(), getProfile()])
  const currency = profile?.currency ?? "INR"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Materials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your costing library. Price a material once here, then pick it from the
            dropdown in the calculator.
          </p>
        </div>
        <MaterialFormDialog
          currency={currency}
          trigger={
            <Button>
              <Plus className="size-4" /> New material
            </Button>
          }
        />
      </div>

      {materials.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No materials yet"
          description="Add the supplies you buy — pack price and how many units are in a pack — and the calculator will do the per-piece maths for you."
          action={
            <MaterialFormDialog
              currency={currency}
              trigger={
                <Button>
                  <Plus className="size-4" /> Add your first material
                </Button>
              }
            />
          }
        />
      ) : (
        <MaterialsGrid materials={materials} currency={currency} />
      )}
    </div>
  )
}
