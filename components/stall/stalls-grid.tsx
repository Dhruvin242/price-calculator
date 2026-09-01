"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarDays, MapPin, MoreHorizontal, Store, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteStall } from "@/lib/actions"
import { formatCurrency } from "@/lib/pricing"
import { computeStallPnl } from "@/lib/stall"
import type { StallListItem } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

function formatDate(value: string | null) {
  if (!value) return "No date set"
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function StallsGrid({
  stalls,
  currency,
}: {
  stalls: StallListItem[]
  currency: string
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [target, setTarget] = React.useState<StallListItem | null>(null)

  function handleDelete() {
    if (!target) return
    const id = target.id
    startTransition(async () => {
      const res = await deleteStall(id)
      if (res.ok) {
        toast.success("Stall deleted")
        setTarget(null)
        router.refresh()
      } else {
        toast.error(res.error ?? "Could not delete stall")
      }
    })
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stalls.map((stall) => {
          const pnl = computeStallPnl(stall, stall.stall_sales)
          const isProfit = pnl.netProfit >= 0
          return (
            <Card
              key={stall.id}
              className="group relative gap-0 p-0 transition-transform active:scale-[0.99]"
            >
              <Link href={`/dashboard/stalls/${stall.id}`} className="block p-5">
                <div className="flex items-start justify-between gap-2 pr-9">
                  <div className="flex size-10 items-center justify-center rounded-2xl border bg-muted/50 text-primary">
                    <Store className="size-5" />
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      isProfit
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {isProfit ? "Profit" : "Loss"}
                  </span>
                </div>

                <h3 className="mt-4 truncate font-heading text-base font-semibold">
                  {stall.name}
                </h3>
                <div className="mt-1.5 flex flex-col gap-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" /> {formatDate(stall.event_date)}
                  </span>
                  {stall.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" /> {stall.location}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-end justify-between border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Net {isProfit ? "profit" : "loss"}</p>
                    <p
                      className={cn(
                        "font-heading text-xl font-semibold tabular-nums",
                        isProfit ? "text-foreground" : "text-destructive"
                      )}
                    >
                      {formatCurrency(pnl.netProfit, currency)}
                    </p>
                  </div>
                  <p className="text-right text-xs text-muted-foreground">
                    {pnl.units} sold
                    <br />
                    {formatCurrency(pnl.revenue, currency)} revenue
                  </p>
                </div>
              </Link>

              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Stall actions"
                        className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem variant="destructive" onClick={() => setTarget(stall)}>
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this stall?</DialogTitle>
            <DialogDescription>
              “{target?.name}” and all its recorded sales will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              Delete stall
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
