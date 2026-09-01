import type { Metadata } from "next"
import { Plus, Store } from "lucide-react"

import { getStalls, getProfile } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { StallsGrid } from "@/components/stall/stalls-grid"
import { StallFormDialog } from "@/components/stall/stall-form-dialog"

export const metadata: Metadata = { title: "Live Stall" }

export default async function StallsPage() {
  const [stalls, profile] = await Promise.all([getStalls(), getProfile()])
  const currency = profile?.currency ?? "INR"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Live Stall</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track a market day end to end — rent, sales, and live profit or loss.
          </p>
        </div>
        <StallFormDialog
          trigger={
            <Button>
              <Plus className="size-4" /> New stall
            </Button>
          }
        />
      </div>

      {stalls.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No stalls yet"
          description="Set up a market day with its rent and expenses, then record sales to watch your profit or loss update live."
          action={
            <StallFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> Create your first stall
                </Button>
              }
            />
          }
        />
      ) : (
        <StallsGrid stalls={stalls} currency={currency} />
      )}
    </div>
  )
}
