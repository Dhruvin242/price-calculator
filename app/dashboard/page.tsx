import Link from "next/link"
import type { Metadata } from "next"
import { Coins, Gauge, HeartPulse, Package, Plus, Sparkles } from "lucide-react"

import { getProducts, getProfile, computeStats } from "@/lib/queries"
import { formatCurrency, formatPercent } from "@/lib/pricing"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { EmptyState } from "@/components/empty-state"
import { HealthBadge } from "@/components/health-badge"

export const metadata: Metadata = { title: "Overview" }

export default async function DashboardPage() {
  const [products, profile] = await Promise.all([getProducts(), getProfile()])
  const stats = computeStats(products)
  const currency = profile?.currency ?? "INR"
  const firstName = (profile?.full_name ?? "").split(" ")[0]
  const recent = products.slice(0, 5)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here’s how your pricing is looking across your catalog.
          </p>
        </div>
        <Button render={<Link href="/dashboard/calculator" />}>
          <Plus className="size-4" /> New product
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Products priced"
          value={String(stats.productCount)}
          hint={stats.productCount === 0 ? "Nothing saved yet" : "In your library"}
        />
        <StatCard
          icon={Gauge}
          label="Average margin"
          value={stats.productCount ? formatPercent(stats.avgMargin) : "—"}
          hint="Net profit margin"
        />
        <StatCard
          icon={Coins}
          label="Profit per unit"
          value={stats.productCount ? formatCurrency(stats.totalPotentialProfit, currency) : "—"}
          hint="Summed across products"
        />
        <StatCard
          icon={HeartPulse}
          label="Healthy pricing"
          value={stats.productCount ? formatPercent(stats.healthyShare, 0) : "—"}
          hint="Products rated green"
        />
      </div>

      <Card className="gap-0 p-0">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-heading text-base font-semibold">Recent products</h2>
            <p className="text-sm text-muted-foreground">Your most recently updated pricing.</p>
          </div>
          {products.length > 0 && (
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/products" />}>
              View all
            </Button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Sparkles}
              title="Price your first product"
              description="Add materials, labor, and overhead, and Bloom Factory will recommend a price that protects your margin."
              action={
                <Button render={<Link href="/dashboard/calculator" />}>
                  <Plus className="size-4" /> Open the calculator
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y">
            {recent.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/dashboard/calculator?id=${product.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.category ?? "Uncategorized"} · Base{" "}
                      {formatCurrency(product.base_cost, currency)}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(product.recommended_price, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercent(product.net_margin)} margin
                    </p>
                  </div>
                  <HealthBadge health={product.health} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
