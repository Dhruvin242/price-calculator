import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { getCustomers, getProfile } from "@/lib/queries"
import { InvoiceForm } from "@/components/invoice/invoice-form"

export const metadata: Metadata = { title: "New invoice" }

export default async function NewInvoicePage() {
  const [customers, profile] = await Promise.all([getCustomers(), getProfile()])
  const currency = profile?.currency ?? "INR"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/invoices"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to invoices
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">New invoice</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a customer, add your line items, and generate the invoice.
          </p>
        </div>
      </div>

      <InvoiceForm customers={customers} defaultCurrency={currency} />
    </div>
  )
}
