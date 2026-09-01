import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Plus } from "lucide-react"

import { getInvoices } from "@/lib/queries"
import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/invoice"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { InvoicesTable } from "@/components/invoice/invoices-table"
import { InvoicesFilter } from "@/components/invoice/invoices-filter"

export const metadata: Metadata = { title: "Invoices" }

function parseStatus(value: string | undefined): InvoiceStatus | undefined {
  return value && (INVOICE_STATUSES as string[]).includes(value)
    ? (value as InvoiceStatus)
    : undefined
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}) {
  const sp = await searchParams
  const status = parseStatus(sp.status)
  const search = sp.q?.trim() || undefined
  const page = Math.max(1, Number(sp.page) || 1)
  const isFiltered = Boolean(status || search)

  const { invoices, total, pageSize } = await getInvoices({ status, search, page })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate and track invoices for your customers.
          </p>
        </div>
        <Button render={<Link href="/dashboard/invoices/new" />}>
          <Plus className="size-4" /> New invoice
        </Button>
      </div>

      {total === 0 && !isFiltered ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Create your first invoice — pick a customer, add line items, and totals are calculated for you."
          action={
            <Button render={<Link href="/dashboard/invoices/new" />}>
              <Plus className="size-4" /> Create your first invoice
            </Button>
          }
        />
      ) : (
        <>
          <InvoicesFilter />
          {invoices.length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-card/50 px-6 py-14 text-center text-sm text-muted-foreground">
              No invoices match your filters.
            </div>
          ) : (
            <>
              <InvoicesTable invoices={invoices} />
              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} searchParams={sp} />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number
  totalPages: number
  searchParams: { status?: string; q?: string }
}) {
  function href(target: number) {
    const params = new URLSearchParams()
    if (searchParams.status) params.set("status", searchParams.status)
    if (searchParams.q) params.set("q", searchParams.q)
    params.set("page", String(target))
    return `/dashboard/invoices?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          render={page <= 1 ? undefined : <Link href={href(page - 1)} />}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          render={page >= totalPages ? undefined : <Link href={href(page + 1)} />}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
