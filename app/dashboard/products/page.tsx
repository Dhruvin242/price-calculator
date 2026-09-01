import Link from "next/link"
import type { Metadata } from "next"
import { Package, Plus } from "lucide-react"

import { getProducts, getProfile } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { ProductsTable } from "@/components/dashboard/products-table"

export const metadata: Metadata = { title: "Products" }

export default async function ProductsPage() {
  const [products, profile] = await Promise.all([getProducts(), getProfile()])
  const currency = profile?.currency ?? "INR"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length > 0
              ? `${products.length} product${products.length === 1 ? "" : "s"} in your library.`
              : "Your saved pricing lives here."}
          </p>
        </div>
        <Button render={<Link href="/dashboard/calculator" />}>
          <Plus className="size-4" /> New product
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Price your first product in the calculator and save it to build up your library."
          action={
            <Button render={<Link href="/dashboard/calculator" />}>
              <Plus className="size-4" /> Open the calculator
            </Button>
          }
        />
      ) : (
        <ProductsTable products={products} currency={currency} />
      )}
    </div>
  )
}
