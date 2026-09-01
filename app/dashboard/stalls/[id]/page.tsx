import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, MapPin, Pencil } from "lucide-react"

import { getStall, getProducts, getProfile } from "@/lib/queries"
import { computeStallPnl } from "@/lib/stall"
import { formatCurrency } from "@/lib/pricing"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StallFormDialog } from "@/components/stall/stall-form-dialog"
import { SaleForm } from "@/components/stall/sale-form"
import { SalesList } from "@/components/stall/sales-list"
import { StallPnlPanel } from "@/components/stall/stall-pnl"

export const metadata: Metadata = { title: "Stall" }

function formatDate(value: string | null) {
  if (!value) return "No date set"
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function StallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [stall, products, profile] = await Promise.all([
    getStall(id),
    getProducts(),
    getProfile(),
  ])

  if (!stall) notFound()
  const currency = profile?.currency ?? "INR"
  const pnl = computeStallPnl(stall, stall.stall_sales)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/stalls"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to stalls
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{stall.name}</h1>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" /> {formatDate(stall.event_date)}
              </span>
              {stall.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {stall.location}
                </span>
              )}
              <span>
                Fixed costs: {formatCurrency(stall.rent + stall.other_expenses, currency)}
              </span>
            </div>
          </div>
          <StallFormDialog
            stall={stall}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil className="size-4" /> Edit stall
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-6">
          <Card className="gap-0 p-5">
            <h2 className="font-heading text-base font-semibold">Record a sale</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Pick a product to auto-fill its price and cost, or add a custom item.
            </p>
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                You don’t have any saved products yet. You can still add custom items — or{" "}
                <Link
                  href="/dashboard/calculator"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  price one first
                </Link>
                .
              </div>
            ) : null}
            <SaleForm stallId={stall.id} products={products} />
          </Card>

          <Card className="gap-0 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold">Sales</h2>
              <span className="text-sm text-muted-foreground">
                {pnl.orders} {pnl.orders === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="mt-2">
              <SalesList sales={stall.stall_sales} stallId={stall.id} currency={currency} />
            </div>
          </Card>
        </div>

        {/* on mobile the live P&L belongs above the entry form, not below it */}
        <div className="max-lg:order-first lg:sticky lg:top-24 lg:self-start">
          <StallPnlPanel pnl={pnl} currency={currency} />
        </div>
      </div>
    </div>
  )
}
