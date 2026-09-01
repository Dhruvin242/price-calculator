import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { getProduct, getProfile } from "@/lib/queries"
import { PricingCalculator } from "@/components/calculator/pricing-calculator"

export const metadata: Metadata = { title: "Calculator" }

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const [product, profile] = await Promise.all([
    id ? getProduct(id) : Promise.resolve(null),
    getProfile(),
  ])
  const currency = profile?.currency ?? "INR"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/products"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to products
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {product ? product.name : "Price a new product"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your costs and margins — the recommended price updates as you type.
          </p>
        </div>
      </div>

      <PricingCalculator product={product} currency={currency} />
    </div>
  )
}
