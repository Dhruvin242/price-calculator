"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { deleteSale } from "@/lib/actions"
import { formatCurrency } from "@/lib/pricing"
import type { StallSaleRow } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SalesList({
  sales,
  stallId,
  currency,
}: {
  sales: StallSaleRow[]
  stallId: string
  currency: string
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [removingId, setRemovingId] = React.useState<string | null>(null)

  function handleDelete(id: string) {
    setRemovingId(id)
    startTransition(async () => {
      const res = await deleteSale(id, stallId)
      if (res.ok) {
        toast.success("Sale removed")
        router.refresh()
      } else {
        toast.error(res.error ?? "Could not remove sale")
      }
      setRemovingId(null)
    })
  }

  if (sales.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No sales yet. Record your first one to see the P&amp;L move.
      </p>
    )
  }

  return (
    <ul className="divide-y">
      {sales.map((sale) => {
        const profit = (sale.unit_price - sale.unit_cost) * sale.quantity
        return (
          <li
            key={sale.id}
            className={cn(
              "flex items-center gap-3 py-3 transition-opacity",
              removingId === sale.id && pending && "opacity-50"
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{sale.product_name}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {sale.quantity} × {formatCurrency(sale.unit_price, currency)}
                <span className="text-muted-foreground/70">
                  {" "}
                  · cost {formatCurrency(sale.unit_cost, currency)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums">
                {formatCurrency(sale.unit_price * sale.quantity, currency)}
              </p>
              <p className="text-xs text-emerald-600 tabular-nums dark:text-emerald-400">
                +{formatCurrency(profit, currency)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remove sale"
              disabled={pending}
              onClick={() => handleDelete(sale.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
