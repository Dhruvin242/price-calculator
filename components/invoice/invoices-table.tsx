"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, MoreHorizontal, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteInvoice } from "@/lib/actions"
import { formatCurrency } from "@/lib/pricing"
import type { InvoiceListItem } from "@/types"
import { Button } from "@/components/ui/button"
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function RowActions({
  invoice,
  onDelete,
}: {
  invoice: InvoiceListItem
  onDelete: (invoice: InvoiceListItem) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${invoice.invoice_number}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={`/dashboard/invoices/${invoice.id}`} />}>
          <Eye className="size-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(invoice)}>
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function InvoicesTable({ invoices }: { invoices: InvoiceListItem[] }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const [target, setTarget] = React.useState<InvoiceListItem | null>(null)

  function handleDelete() {
    if (!target) return
    const id = target.id
    startTransition(async () => {
      const res = await deleteInvoice(id)
      if (res.ok) {
        toast.success("Invoice deleted")
        setTarget(null)
        router.refresh()
      } else {
        toast.error(res.error ?? "Could not delete invoice")
      }
    })
  }

  return (
    <>
      {/* mobile: stacked cards, no sideways scrolling */}
      <div className="flex flex-col gap-3 md:hidden">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-start gap-2 rounded-3xl border bg-card p-4 transition-transform active:scale-[0.99]"
          >
            <Link
              href={`/dashboard/invoices/${invoice.id}`}
              className="-m-1 min-w-0 flex-1 rounded-2xl p-1"
            >
              <div className="flex items-center gap-2">
                <span className="truncate font-mono text-sm font-medium">
                  {invoice.invoice_number}
                </span>
                <InvoiceStatusBadge status={invoice.status} />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-1 truncate text-sm">{invoice.customer_name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {formatDate(invoice.issue_date)} · due {formatDate(invoice.due_date)}
              </p>
              <p className="mt-2 font-heading text-lg font-semibold tabular-nums">
                {formatCurrency(invoice.grand_total, invoice.currency)}
              </p>
            </Link>
            <RowActions invoice={invoice} onDelete={setTarget} />
          </div>
        ))}
      </div>

      {/* desktop: full table */}
      <div className="hidden overflow-hidden rounded-3xl border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="font-mono font-medium hover:underline"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">{invoice.customer_name}</td>
                  <td className="px-5 py-3.5 tabular-nums text-muted-foreground">
                    {formatDate(invoice.issue_date)}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-muted-foreground">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                    {formatCurrency(invoice.grand_total, invoice.currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <RowActions invoice={invoice} onDelete={setTarget} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this invoice?</DialogTitle>
            <DialogDescription>
              “{target?.invoice_number}” and its line items will be permanently removed. This
              can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              Delete invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
