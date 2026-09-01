"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import { addSale } from "@/lib/actions"
import { formatCurrency } from "@/lib/pricing"
import type { ProductRow } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberInput } from "@/components/calculator/number-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CUSTOM = "__custom__"

export function SaleForm({
  stallId,
  products,
}: {
  stallId: string
  products: Pick<ProductRow, "id" | "name" | "base_cost" | "recommended_price">[]
}) {
  const router = useRouter()
  const [saving, startSaving] = React.useTransition()

  const [selection, setSelection] = React.useState<string>(products[0]?.id ?? CUSTOM)
  const [name, setName] = React.useState(products[0]?.name ?? "")
  const [price, setPrice] = React.useState(products[0]?.recommended_price ?? 0)
  const [cost, setCost] = React.useState(products[0]?.base_cost ?? 0)
  const [quantity, setQuantity] = React.useState(1)

  const isCustom = selection === CUSTOM

  // Maps each value to a readable label so the trigger shows the product name
  // (not its id) when selected.
  const itemLabels = React.useMemo(() => {
    const labels: Record<string, string> = { [CUSTOM]: "Custom item…" }
    for (const product of products) labels[product.id] = product.name
    return labels
  }, [products])

  function onSelectProduct(value: string | null) {
    if (!value) return
    setSelection(value)
    if (value === CUSTOM) {
      setName("")
      setPrice(0)
      setCost(0)
      return
    }
    const product = products.find((p) => p.id === value)
    if (product) {
      setName(product.name)
      setPrice(product.recommended_price)
      setCost(product.base_cost)
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Choose or name a product.")
      return
    }
    startSaving(async () => {
      const res = await addSale({
        stall_id: stallId,
        product_id: isCustom ? null : selection,
        product_name: name,
        unit_price: price,
        unit_cost: cost,
        quantity,
      })
      if (!res.ok) {
        toast.error(res.error ?? "Could not record sale")
        return
      }
      toast.success("Sale recorded")
      setQuantity(1)
      router.refresh()
    })
  }

  const lineTotal = price * quantity

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Product</Label>
        <Select value={selection} onValueChange={onSelectProduct} items={itemLabels}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} · {formatCurrency(product.recommended_price)}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM}>Custom item…</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCustom && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sale-name">Item name</Label>
          <Input
            id="sale-name"
            placeholder="One-off item"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Sell price</Label>
          <NumberInput value={price} onValueChange={setPrice} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Unit cost</Label>
          <NumberInput value={cost} onValueChange={setCost} />
        </div>
      </div>

      {/* stepper — recording sales at a stall is a one-thumb job */}
      <div className="flex flex-col gap-1.5">
        <Label>Quantity</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-4" />
          </Button>
          <NumberInput
            className="flex-1 text-center text-base font-semibold"
            aria-label="Quantity"
            value={quantity}
            min={1}
            onValueChange={(v) => setQuantity(v || 1)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-3 py-2.5 text-sm">
        <span className="text-muted-foreground">Line total</span>
        <span className="font-semibold tabular-nums">{formatCurrency(lineTotal)}</span>
      </div>

      <Button type="submit" size="lg" disabled={saving} className="w-full">
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Record sale
      </Button>
    </form>
  )
}
