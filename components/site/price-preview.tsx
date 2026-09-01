import { ArrowUpRight, CircleCheck } from "lucide-react"

import {
  calculatePricing,
  formatCurrency,
  formatPercent,
  materialLineCost,
  sampleInputs,
} from "@/lib/pricing"
import { cn } from "@/lib/utils"

const inputs = sampleInputs()
const result = calculatePricing(inputs)

export function PricePreview({ className }: { className?: string }) {
  const rows = [
    { label: "Materials", value: result.totalMaterialCost },
    { label: "Labor", value: result.laborCost },
    { label: "Overhead", value: result.totalOverhead },
  ]

  return (
    <div
      className={cn(
        "w-full rounded-3xl border bg-card p-1 shadow-2xl shadow-primary/5 ring-1 ring-black/[0.02]",
        className
      )}
    >
      <div className="rounded-[1.35rem] border bg-background">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/40" />
            <span className="size-2.5 rounded-full bg-amber-400/50" />
            <span className="size-2.5 rounded-full bg-emerald-400/50" />
          </div>
          <div className="ml-2 truncate text-xs font-medium text-muted-foreground">
            Preserved rose arrangement · Floral
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CircleCheck className="size-3" /> Healthy
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2">
          {/* cost breakdown */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Cost breakdown</p>
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium tabular-nums">{formatCurrency(row.value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
                <span>Base cost</span>
                <span className="tabular-nums">{formatCurrency(result.baseCost)}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              {inputs.materials.slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{m.name}</span>
                  <span className="tabular-nums">{formatCurrency(materialLineCost(m))}</span>
                </div>
              ))}
            </div>
          </div>

          {/* recommended price */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] p-4 ring-1 ring-primary/10">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Recommended retail</p>
              <p className="mt-1 font-heading text-3xl font-semibold tracking-tight tabular-nums">
                {formatCurrency(result.finalSellingPrice)}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3" />
                {formatPercent(result.netProfitMargin)} net margin
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-background/60 p-2.5">
                <p className="text-muted-foreground">Wholesale</p>
                <p className="mt-0.5 font-semibold tabular-nums">
                  {formatCurrency(result.wholesalePrice)}
                </p>
              </div>
              <div className="rounded-xl bg-background/60 p-2.5">
                <p className="text-muted-foreground">Net profit</p>
                <p className="mt-0.5 font-semibold tabular-nums">
                  {formatCurrency(result.netProfit)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
