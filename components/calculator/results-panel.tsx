import { ArrowUpRight } from "lucide-react"

import {
  formatCurrency,
  formatPercent,
  healthFromMargin,
  HEALTH_META,
  type HealthStatus,
  type PriceBasis,
  type PricingResult,
} from "@/lib/pricing"
import { HealthBadge } from "@/components/health-badge"
import { cn } from "@/lib/utils"

const HEALTH_DOT: Record<HealthStatus, string> = {
  HEALTHY: "text-emerald-600 dark:text-emerald-400",
  WATCH: "text-amber-600 dark:text-amber-400",
  LOW: "text-destructive",
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-1.5 text-sm",
        strong && "border-t pt-2.5 font-semibold"
      )}
    >
      <span className={cn(strong ? "text-foreground" : "text-muted-foreground")}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

function OptionTile({
  label,
  value,
  margin,
  health,
  selected,
  onSelect,
}: {
  label: string
  value: string
  margin: number
  health: HealthStatus
  selected: boolean
  onSelect?: () => void
}) {
  const className = cn(
    "rounded-2xl border p-3 text-left transition-colors",
    selected
      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
      : "border-border bg-background/50",
    onSelect && !selected && "hover:border-primary/30 hover:bg-primary/[0.03]"
  )

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {selected && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Used
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-1 font-heading text-lg font-semibold tabular-nums",
          selected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {value}
      </p>
      <p className={cn("mt-1 flex items-center gap-1.5 text-xs font-medium", HEALTH_DOT[health])}>
        <span className="size-1.5 rounded-full bg-current" />
        {formatPercent(margin, 0)} · {HEALTH_META[health].label}
      </p>
    </>
  )

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(className, "outline-none focus-visible:ring-3 focus-visible:ring-ring/30")}
      >
        {inner}
      </button>
    )
  }
  return <div className={className}>{inner}</div>
}

export function ResultsPanel({
  result,
  currency,
  basis,
  onBasisChange,
}: {
  result: PricingResult
  currency: string
  basis?: PriceBasis
  onBasisChange?: (basis: PriceBasis) => void
}) {
  const activeBasis: PriceBasis = basis ?? "auto"
  return (
    <div className="flex flex-col gap-4">
      {/* headline price */}
      <div className="rounded-3xl border bg-gradient-to-br from-primary/[0.08] to-transparent p-5 ring-1 ring-primary/10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Recommended price</p>
          <HealthBadge health={result.health} />
        </div>
        <p className="mt-2 font-heading text-4xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(result.finalSellingPrice, currency)}
        </p>
        <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="size-4" />
          {formatCurrency(result.netProfit, currency)} profit · {formatPercent(result.netProfitMargin)} margin
        </p>

        {/* which retail basis was chosen — with the margin/health of each */}
        {(() => {
          const feePct =
            result.finalSellingPrice > 0 ? result.platformFees / result.finalSellingPrice : 0
          const marginAt = (price: number) =>
            price > 0 ? (price - result.baseCost - price * feePct) / price : 0
          const keystoneMargin = marginAt(result.keystoneRetail)
          const customMargin = marginAt(result.customRetailTarget)

          return (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <OptionTile
                label="Keystone (×2)"
                value={formatCurrency(result.keystoneRetail, currency)}
                margin={keystoneMargin}
                health={healthFromMargin(keystoneMargin)}
                selected={result.resolvedBasis === "keystone"}
                onSelect={onBasisChange ? () => onBasisChange("keystone") : undefined}
              />
              <OptionTile
                label="Custom target"
                value={formatCurrency(result.customRetailTarget, currency)}
                margin={customMargin}
                health={healthFromMargin(customMargin)}
                selected={result.resolvedBasis === "custom"}
                onSelect={onBasisChange ? () => onBasisChange("custom") : undefined}
              />
            </div>
          )
        })()}

        {onBasisChange && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Use:</span>
            <div className="inline-flex rounded-full border bg-background/50 p-0.5">
              {(
                [
                  { value: "auto", label: "Auto" },
                  { value: "keystone", label: "Keystone" },
                  { value: "custom", label: "Custom" },
                ] as { value: PriceBasis; label: string }[]
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onBasisChange(option.value)}
                  aria-pressed={activeBasis === option.value}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    activeBasis === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {activeBasis === "auto"
            ? "Using the higher of the two"
            : `Locked to ${activeBasis === "keystone" ? "keystone" : "custom target"}`}
          {result.platformFees > 0 ? ", then grossed up for platform fees" : ""}.{" "}
          {HEALTH_META[result.health].description}
        </p>
      </div>

      {/* cost breakdown */}
      <div className="rounded-3xl border bg-card p-5">
        <p className="text-sm font-semibold">Cost breakdown</p>
        <div className="mt-2">
          <Row label="Materials" value={formatCurrency(result.totalMaterialCost, currency)} />
          <Row label="Labor" value={formatCurrency(result.laborCost, currency)} />
          <Row label="Overhead" value={formatCurrency(result.totalOverhead, currency)} />
          <Row label="Base cost" value={formatCurrency(result.baseCost, currency)} strong />
        </div>
      </div>

      {/* price ladder */}
      <div className="rounded-3xl border bg-card p-5">
        <p className="text-sm font-semibold">Price options</p>
        <div className="mt-2">
          <Row label="Wholesale" value={formatCurrency(result.wholesalePrice, currency)} />
          <Row label="Keystone retail" value={formatCurrency(result.keystoneRetail, currency)} />
          <Row label="Custom retail target" value={formatCurrency(result.customRetailTarget, currency)} />
          <Row label="Platform fees" value={formatCurrency(result.platformFees, currency)} />
          <Row label="Markup on base" value={formatPercent(result.markupOnBase)} />
        </div>
      </div>
    </div>
  )
}
