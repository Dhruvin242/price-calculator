import { Check } from "lucide-react"

import {
  formatCurrency,
  materialLineCost,
  sampleInputs,
} from "@/lib/pricing"

const inputs = sampleInputs()

const POINTS = [
  "Enter pack price, pack size, and quantity used — cost per piece is automatic.",
  "Adjust wholesale and retail margins and watch every price update live.",
  "Overhead and platform fees are folded in, so the final price is the real one.",
]

export function Showcase() {
  return (
    <section id="about" className="scroll-mt-20 border-t bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-primary">The workspace</p>
          <h2 className="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Your recipe in, a defensible price out
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            No more juggling cells and formulas. Build a product from its real inputs and
            Bloom Factory does the pricing math the same way every time.
          </p>

          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3.5" />
                </span>
                <span className="text-sm text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* realistic materials table mock */}
        <div className="rounded-3xl border bg-card p-1 shadow-xl shadow-primary/5">
          <div className="rounded-[1.35rem] border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Direct materials</p>
              <span className="text-xs text-muted-foreground">Per piece</span>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Material</th>
                    <th className="px-3 py-2 text-right font-medium">Qty</th>
                    <th className="px-3 py-2 text-right font-medium">Pack</th>
                    <th className="px-3 py-2 text-right font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {inputs.materials.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="px-3 py-2.5 font-medium">{m.name}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                        {m.qtyPerPiece}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(m.packageCost)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                        {formatCurrency(materialLineCost(m))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5 text-sm">
              <span className="font-medium">Total material cost</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(
                  inputs.materials.reduce((s, m) => s + materialLineCost(m), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
