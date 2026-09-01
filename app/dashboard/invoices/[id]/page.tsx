import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { getInvoice, getProfile, getUser } from "@/lib/queries"
import { InvoicePreview } from "@/components/invoice/invoice-preview"
import { InvoiceStatusControl } from "@/components/invoice/invoice-status-control"
import { PrintButton } from "@/components/invoice/print-button"

export const metadata: Metadata = { title: "Invoice" }

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [invoice, profile, user] = await Promise.all([
    getInvoice(id),
    getProfile(),
    getUser(),
  ])

  if (!invoice) notFound()

  const business = {
    name: invoice.business_name ?? profile?.business_name ?? profile?.full_name ?? null,
    email: user?.email ?? null,
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 print:hidden">
        <Link
          href="/dashboard/invoices"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to invoices
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {invoice.invoice_number}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Billed to {invoice.customer_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PrintButton />
            <InvoiceStatusControl id={invoice.id} status={invoice.status} />
          </div>
        </div>
      </div>

      <InvoicePreview invoice={invoice} business={business} />
    </div>
  )
}
