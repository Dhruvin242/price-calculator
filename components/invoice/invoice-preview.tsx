import { formatCurrency } from "@/lib/pricing"
import type { InvoiceWithItems } from "@/types"
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge"

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function discountLabel(type: string, value: number, currency: string) {
  if (!value) return "—"
  return type === "percent" ? `${value}%` : formatCurrency(value, currency)
}

export interface BusinessInfo {
  name: string | null
  email: string | null
}

/**
 * Presentational invoice document. Deliberately free of client-only APIs so it
 * can be server-rendered and later fed to a PDF/print pipeline unchanged.
 */
export function InvoicePreview({
  invoice,
  business,
}: {
  invoice: InvoiceWithItems
  business: BusinessInfo
}) {
  const currency = invoice.currency

  return (
    <div className="rounded-3xl border bg-card p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-heading text-xl font-semibold tracking-tight">
            {business.name ?? "Your business"}
          </p>
          {business.email && (
            <p className="mt-0.5 text-sm text-muted-foreground">{business.email}</p>
          )}
        </div>
        <div className="sm:text-right">
          <p className="font-heading text-2xl font-semibold tracking-tight">Invoice</p>
          <p className="mt-0.5 font-mono text-sm text-muted-foreground">
            {invoice.invoice_number}
          </p>
          <div className="mt-2 sm:flex sm:justify-end">
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>
      </div>

      {/* Parties + dates */}
      <div className="grid gap-6 py-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Bill to
          </p>
          <p className="mt-1.5 font-medium">{invoice.customer_name}</p>
          {invoice.customer_email && (
            <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
          )}
          {invoice.customer_billing_address && (
            <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">
              {invoice.customer_billing_address}
            </p>
          )}
        </div>
        <div className="sm:text-right">
          <div className="flex justify-between gap-4 text-sm sm:justify-end">
            <span className="text-muted-foreground">Invoice date</span>
            <span className="font-medium tabular-nums">{formatDate(invoice.issue_date)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-4 text-sm sm:justify-end">
            <span className="text-muted-foreground">Due date</span>
            <span className="font-medium tabular-nums">{formatDate(invoice.due_date)}</span>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-y text-left text-xs text-muted-foreground">
              <th className="py-2.5 pr-4 font-medium">Description</th>
              <th className="px-3 py-2.5 text-right font-medium">Qty</th>
              <th className="px-3 py-2.5 text-right font-medium">Unit price</th>
              <th className="px-3 py-2.5 text-right font-medium">Discount</th>
              <th className="px-3 py-2.5 text-right font-medium">Tax</th>
              <th className="py-2.5 pl-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.invoice_items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3 pr-4">{item.description}</td>
                <td className="px-3 py-3 text-right tabular-nums">{item.quantity}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {formatCurrency(item.unit_price, currency)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                  {discountLabel(item.discount_type, item.discount_value, currency)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                  {item.tax_rate_pct ? `${item.tax_rate_pct}%` : "—"}
                </td>
                <td className="py-3 pl-3 text-right font-medium tabular-nums">
                  {formatCurrency(item.line_total, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs">
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(invoice.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="tabular-nums">
              − {formatCurrency(invoice.total_discount, currency)}
            </span>
          </div>
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="tabular-nums">{formatCurrency(invoice.total_tax, currency)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t pt-3">
            <span className="font-semibold">Grand total</span>
            <span className="font-heading text-xl font-semibold tabular-nums">
              {formatCurrency(invoice.grand_total, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes + terms */}
      {(invoice.payment_terms || invoice.notes) && (
        <div className="mt-6 grid gap-6 border-t pt-6 sm:grid-cols-2">
          {invoice.payment_terms && (
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Payment terms
              </p>
              <p className="mt-1.5 text-sm whitespace-pre-line text-muted-foreground">
                {invoice.payment_terms}
              </p>
            </div>
          )}
          {invoice.notes && (
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Notes
              </p>
              <p className="mt-1.5 text-sm whitespace-pre-line text-muted-foreground">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
