"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteProduct, saveProduct } from "@/lib/actions"
import {
  calculatePricing,
  formatCurrency,
  formatPercent,
  healthFromMargin,
  HEALTH_META,
  type HealthStatus,
} from "@/lib/pricing"
import type { ProductRow } from "@/types"
import { cn } from "@/lib/utils"
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

const HEALTH_TEXT: Record<HealthStatus, string> = {
  HEALTHY: "text-emerald-600 dark:text-emerald-400",
  WATCH: "text-amber-600 dark:text-amber-400",
  LOW: "text-destructive",
}

function OptionCell({
  price,
  margin,
  used,
}: {
  price: string
  margin: number
  used: boolean
}) {
  const health = healthFromMargin(margin)
  return (
    <td className="px-5 py-3 text-right align-middle">
      <div className="flex items-center justify-end gap-1.5">
        <span className={cn("font-semibold tabular-nums", HEALTH_TEXT[health])}>{price}</span>
        {used && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Used
          </span>
        )}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
        {formatPercent(margin, 0)} · {HEALTH_META[health].label}
      </div>
    </td>
  )
}

/** Mobile equivalent of `OptionCell` — a tile inside the product card. */
function OptionTile({
  label,
  price,
  margin,
  used,
}: {
  label: string
  price: string
  margin: number
  used: boolean
}) {
  const health = healthFromMargin(margin)
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-2",
        used ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        {used && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Used
          </span>
        )}
      </div>
      <p className={cn("mt-0.5 font-semibold tabular-nums", HEALTH_TEXT[health])}>{price}</p>
      <p className="text-[11px] text-muted-foreground tabular-nums">
        {formatPercent(margin, 0)} · {HEALTH_META[health].label}
      </p>
    </div>
  )
}

function RowActions({
  product,
  pending,
  onDuplicate,
  onDelete,
}: {
  product: ProductRow
  pending: boolean
  onDuplicate: (product: ProductRow) => void
  onDelete: (product: ProductRow) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${product.name}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={`/dashboard/calculator?id=${product.id}`} />}>
          <Pencil className="size-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(product)} disabled={pending}>
          <Copy className="size-4" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(product)}>
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Per-product derived figures shared by the card and table renderings. */
function usePricingRow(product: ProductRow) {
  return React.useMemo(() => {
    const pricing = calculatePricing(product.inputs)
    const feePct =
      pricing.finalSellingPrice > 0 ? pricing.platformFees / pricing.finalSellingPrice : 0
    const marginAt = (price: number) =>
      price > 0 ? (price - pricing.baseCost - price * feePct) / price : 0
    return {
      pricing,
      keystoneUsed: pricing.resolvedBasis === "keystone",
      keystoneMargin: marginAt(pricing.keystoneRetail),
      customMargin: marginAt(pricing.customRetailTarget),
    }
  }, [product])
}

function ProductCard({
  product,
  currency,
  pending,
  onDuplicate,
  onDelete,
}: {
  product: ProductRow
  currency: string
  pending: boolean
  onDuplicate: (product: ProductRow) => void
  onDelete: (product: ProductRow) => void
}) {
  const { pricing, keystoneUsed, keystoneMargin, customMargin } = usePricingRow(product)

  return (
    <div className="rounded-3xl border bg-card p-4 transition-transform active:scale-[0.99]">
      <div className="flex items-start gap-2">
        <Link
          href={`/dashboard/calculator?id=${product.id}`}
          className="-m-1 min-w-0 flex-1 rounded-2xl p-1"
        >
          <p className="flex items-center gap-1 truncate font-medium">
            {product.name}
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {product.category ?? "Uncategorized"} · Base{" "}
            <span className="tabular-nums">{formatCurrency(product.base_cost, currency)}</span>
          </p>
        </Link>
        <RowActions
          product={product}
          pending={pending}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <OptionTile
          label="Keystone (×2)"
          price={formatCurrency(pricing.keystoneRetail, currency)}
          margin={keystoneMargin}
          used={keystoneUsed}
        />
        <OptionTile
          label="Custom target"
          price={formatCurrency(pricing.customRetailTarget, currency)}
          margin={customMargin}
          used={!keystoneUsed}
        />
      </div>
    </div>
  )
}

function ProductTableRow({
  product,
  currency,
  pending,
  onDuplicate,
  onDelete,
}: {
  product: ProductRow
  currency: string
  pending: boolean
  onDuplicate: (product: ProductRow) => void
  onDelete: (product: ProductRow) => void
}) {
  const { pricing, keystoneUsed, keystoneMargin, customMargin } = usePricingRow(product)

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-5 py-3.5">
        <Link href={`/dashboard/calculator?id=${product.id}`} className="block">
          <p className="font-medium hover:underline">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.category ?? "Uncategorized"}</p>
        </Link>
      </td>
      <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">
        {formatCurrency(product.base_cost, currency)}
      </td>
      <OptionCell
        price={formatCurrency(pricing.keystoneRetail, currency)}
        margin={keystoneMargin}
        used={keystoneUsed}
      />
      <OptionCell
        price={formatCurrency(pricing.customRetailTarget, currency)}
        margin={customMargin}
        used={!keystoneUsed}
      />
      <td className="px-5 py-3.5 text-right">
        <RowActions
          product={product}
          pending={pending}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}

export function ProductsTable({
  products,
  currency,
}: {
  products: ProductRow[]
  currency: string
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [target, setTarget] = React.useState<ProductRow | null>(null)

  function handleDuplicate(product: ProductRow) {
    startTransition(async () => {
      const result = await saveProduct({
        name: `${product.name} (copy)`,
        category: product.category,
        inputs: product.inputs,
      })
      if (result.ok) {
        toast.success("Product duplicated")
        router.refresh()
      } else {
        toast.error(result.error ?? "Could not duplicate product")
      }
    })
  }

  function handleDelete() {
    if (!target) return
    const id = target.id
    startTransition(async () => {
      const result = await deleteProduct(id)
      if (result.ok) {
        toast.success("Product deleted")
        setTarget(null)
        router.refresh()
      } else {
        toast.error(result.error ?? "Could not delete product")
      }
    })
  }

  return (
    <>
      {/* mobile: stacked cards, no sideways scrolling */}
      <div className="flex flex-col gap-3 md:hidden">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            pending={pending}
            onDuplicate={handleDuplicate}
            onDelete={setTarget}
          />
        ))}
      </div>

      {/* desktop: full table */}
      <div className="hidden overflow-hidden rounded-3xl border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 text-right font-medium">Base cost</th>
                <th className="px-5 py-3 text-right font-medium">Keystone (×2)</th>
                <th className="px-5 py-3 text-right font-medium">Custom target</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  currency={currency}
                  pending={pending}
                  onDuplicate={handleDuplicate}
                  onDelete={setTarget}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>
              “{target?.name}” will be permanently removed. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              Delete product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
