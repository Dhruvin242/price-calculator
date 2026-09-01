"use client"

import * as React from "react"
import { ChevronUp, Loader2, RotateCcw, Save } from "lucide-react"

import {
  formatCurrency,
  formatPercent,
  type PriceBasis,
  type PricingResult,
} from "@/lib/pricing"
import { HealthBadge } from "@/components/health-badge"
import { ResultsPanel } from "@/components/calculator/results-panel"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

/**
 * Below `lg` the results column would sit a long scroll beneath the form, so
 * the recommended price rides along in a sticky bar instead. Tapping it opens
 * the full breakdown in a bottom sheet — the price stays one thumb away while
 * costs are being typed in.
 */
export function MobileResultsBar({
  result,
  currency,
  basis,
  onBasisChange,
  onSave,
  onReset,
  saving,
  saveLabel,
}: {
  result: PricingResult
  currency: string
  basis: PriceBasis
  onBasisChange: (basis: PriceBasis) => void
  onSave: () => void
  onReset: () => void
  saving: boolean
  saveLabel: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-20 -mx-4 border-b border-border/70 bg-background/90 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                aria-label="Show the full pricing breakdown"
                className="-m-1 flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 text-left transition-transform active:scale-[0.98]"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Recommended
                    </span>
                    <HealthBadge health={result.health} />
                  </span>
                  <span className="mt-0.5 flex items-baseline gap-2">
                    <span className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
                      {formatCurrency(result.finalSellingPrice, currency)}
                    </span>
                    <span className="truncate text-xs text-muted-foreground tabular-nums">
                      {formatPercent(result.netProfitMargin)} margin
                    </span>
                  </span>
                </span>
                <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
              </button>
            }
          />

          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="max-h-[88svh] rounded-t-3xl pb-safe"
          >
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border" aria-hidden />
            <SheetTitle className="px-5 pt-4 pb-2">Pricing breakdown</SheetTitle>

            <div className="overscroll-lock min-h-0 flex-1 overflow-y-auto px-5 pb-4">
              <ResultsPanel
                result={result}
                currency={currency}
                basis={basis}
                onBasisChange={onBasisChange}
              />
            </div>

            <div className="flex shrink-0 gap-2 border-t p-4">
              <Button
                variant="outline"
                onClick={() => {
                  onReset()
                  setOpen(false)
                }}
                className="flex-1"
              >
                <RotateCcw className="size-4" /> Reset
              </Button>
              <Button
                onClick={() => {
                  onSave()
                  setOpen(false)
                }}
                disabled={saving}
                className="flex-1"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saveLabel}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Button size="sm" onClick={onSave} disabled={saving} className="shrink-0">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save
        </Button>
      </div>
    </div>
  )
}
