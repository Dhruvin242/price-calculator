import { TrendingDown, TrendingUp } from "lucide-react"

import { formatCurrency, formatPercent } from "@/lib/pricing"
import type { StallPnl } from "@/lib/stall"
import { cn } from "@/lib/utils"

function Row({
  label,
  value,
  muted,
  strong,
  negative,
}: {
  label: string
  value: string
  muted?: boolean
  strong?: boolean
  negative?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-1.5 text-sm",
        strong && "border-t pt-2.5 font-semibold"
      )}
    >
      <span className={cn(muted ? "text-muted-foreground" : "text-foreground")}>{label}</span>
      <span className={cn("tabular-nums", negative && "text-destructive")}>{value}</span>
    </div>
  )
}

export function StallPnlPanel({
  pnl,
  currency,
}: {
  pnl: StallPnl
  currency: string
}) {
  const isProfit = pnl.netProfit >= 0

  return (
    <div className="flex flex-col gap-4">
      {/* headline */}
      <div
        className={cn(
          "rounded-3xl border p-5 ring-1",
          isProfit
            ? "bg-emerald-500/[0.06] ring-emerald-500/15"
            : "bg-destructive/[0.06] ring-destructive/15"
        )}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {isProfit ? "Net profit" : "Net loss"}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              isProfit
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isProfit ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {formatPercent(pnl.netMargin, 0)} margin
          </span>
        </div>
        <p
          className={cn(
            "mt-2 font-heading text-4xl font-semibold tracking-tight tabular-nums",
            isProfit ? "text-foreground" : "text-destructive"
          )}
        >
          {formatCurrency(pnl.netProfit, currency)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {pnl.orders} {pnl.orders === 1 ? "sale" : "sales"} · {pnl.units}{" "}
          {pnl.units === 1 ? "unit" : "units"} sold
        </p>
      </div>

      {/* breakdown */}
      <div className="rounded-3xl border bg-card p-5">
        <p className="text-sm font-semibold">Profit &amp; loss</p>
        <div className="mt-2">
          <Row label="Revenue" value={formatCurrency(pnl.revenue, currency)} muted />
          <Row label="Cost of goods" value={`− ${formatCurrency(pnl.cogs, currency)}`} muted />
          <Row label="Gross profit" value={formatCurrency(pnl.grossProfit, currency)} strong />
          <Row
            label="Fixed costs (rent + expenses)"
            value={`− ${formatCurrency(pnl.fixedCosts, currency)}`}
            muted
          />
          <Row
            label="Net profit"
            value={formatCurrency(pnl.netProfit, currency)}
            strong
            negative={!isProfit}
          />
        </div>
        {!isProfit && pnl.breakEvenRevenue > 0 && (
          <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Sell about{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(pnl.breakEvenRevenue, currency)}
            </span>{" "}
            in revenue at this margin to break even.
          </p>
        )}
      </div>
    </div>
  )
}
