"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { createInvoice } from "@/lib/actions"
import {
  computeInvoice,
  validateInvoiceDraft,
  type DiscountType,
  type InvoiceItemInput,
  type InvoiceStatus,
} from "@/lib/invoice"
import { formatCurrency, newId } from "@/lib/pricing"
import type { CustomerRow } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { NumberInput } from "@/components/calculator/number-input"
import { CustomerFormDialog } from "@/components/customer/customer-form-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LineRow extends InvoiceItemInput {
  id: string
}

function emptyLine(): LineRow {
  return {
    id: newId(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    discountType: "amount",
    discountValue: 0,
    taxRatePct: 0,
  }
}

function toItemInput(line: LineRow): InvoiceItemInput {
  return {
    description: line.description,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    discountType: line.discountType,
    discountValue: line.discountValue,
    taxRatePct: line.taxRatePct,
  }
}

function todayISO(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const DISCOUNT_LABELS: Record<DiscountType, string> = {
  amount: "Amount",
  percent: "%",
}

export function InvoiceForm({
  customers,
  defaultCurrency,
}: {
  customers: CustomerRow[]
  defaultCurrency: string
}) {
  const router = useRouter()
  const [saving, startSaving] = React.useTransition()

  const [customerId, setCustomerId] = React.useState<string | null>(
    customers[0]?.id ?? null
  )
  const [invoiceDate, setInvoiceDate] = React.useState(todayISO())
  const [dueDate, setDueDate] = React.useState<string | null>(null)
  const [currency, setCurrency] = React.useState(defaultCurrency)
  const [status, setStatus] = React.useState<InvoiceStatus>("draft")
  const [notes, setNotes] = React.useState("")
  const [paymentTerms, setPaymentTerms] = React.useState("")
  const [lines, setLines] = React.useState<LineRow[]>([emptyLine()])

  const customerLabels = React.useMemo(() => {
    const labels: Record<string, string> = {}
    for (const c of customers) labels[c.id] = c.name
    return labels
  }, [customers])

  const totals = React.useMemo(() => computeInvoice(lines.map(toItemInput)), [lines])

  function updateLine(id: string, patch: Partial<LineRow>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }
  function addLine() {
    setLines((prev) => [...prev, emptyLine()])
  }
  function removeLine(id: string) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.id !== id)))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const items: InvoiceItemInput[] = lines.map((line) => ({
      ...toItemInput(line),
      description: line.description.trim(),
    }))

    const validation = validateInvoiceDraft({
      customerId,
      invoiceDate,
      dueDate,
      currency,
      status,
      notes: notes || null,
      paymentTerms: paymentTerms || null,
      items,
    })
    if (!validation.ok) {
      toast.error(validation.errors[0])
      return
    }

    startSaving(async () => {
      const res = await createInvoice({
        customerId: customerId!,
        invoiceDate,
        dueDate,
        currency: currency.toUpperCase(),
        status,
        notes: notes || null,
        paymentTerms: paymentTerms || null,
        items,
      })
      if (!res.ok) {
        toast.error(res.error ?? "Could not generate the invoice")
        return
      }
      toast.success("Invoice generated")
      if (res.id) router.push(`/dashboard/invoices/${res.id}`)
      else router.push("/dashboard/invoices")
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]"
    >
      <div className="flex flex-col gap-6">
        {/* Customer + dates */}
        <Card className="gap-0 p-5">
          <h2 className="font-heading text-base font-semibold">Details</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Who this invoice is for and when it’s due.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Customer</Label>
              {customers.length === 0 ? (
                <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed px-4 py-4 text-sm text-muted-foreground">
                  <span>Add a customer to bill this invoice to.</span>
                  <CustomerFormDialog
                    onSaved={(id) => setCustomerId(id)}
                    trigger={
                      <Button type="button" size="sm" variant="outline">
                        <UserPlus className="size-4" /> New customer
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={customerId ?? ""}
                    onValueChange={(v) => setCustomerId(v)}
                    items={customerLabels}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CustomerFormDialog
                    onSaved={(id) => setCustomerId(id)}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="New customer"
                      >
                        <UserPlus className="size-4" />
                      </Button>
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invoice-date">Invoice date</Label>
                <DatePicker
                  id="invoice-date"
                  value={invoiceDate}
                  onChange={(next) => setInvoiceDate(next ?? todayISO())}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="due-date">Due date</Label>
                <DatePicker id="due-date" value={dueDate} onChange={setDueDate} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={currency}
                  maxLength={3}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="uppercase"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as InvoiceStatus)}
                  items={{ draft: "Draft", issued: "Issued" }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Line items */}
        <Card className="gap-0 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">Line items</h2>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="size-4" /> Add line
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {lines.map((line, index) => {
              const computed = totals.lines[index]
              return (
                <div key={line.id} className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Line {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove line ${index + 1}`}
                      disabled={lines.length === 1}
                      onClick={() => removeLine(line.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5">
                    <Label htmlFor={`desc-${line.id}`} className="text-xs">
                      Description
                    </Label>
                    <Input
                      id={`desc-${line.id}`}
                      placeholder="Item or service"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, { description: e.target.value })}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Qty</Label>
                      <NumberInput
                        value={line.quantity}
                        onValueChange={(v) => updateLine(line.id, { quantity: v })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Unit price</Label>
                      <NumberInput
                        value={line.unitPrice}
                        onValueChange={(v) => updateLine(line.id, { unitPrice: v })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Discount</Label>
                      <div className="flex gap-1.5">
                        <NumberInput
                          value={line.discountValue}
                          onValueChange={(v) => updateLine(line.id, { discountValue: v })}
                          className="min-w-0"
                        />
                        <Select
                          value={line.discountType}
                          onValueChange={(v) =>
                            updateLine(line.id, { discountType: v as DiscountType })
                          }
                          items={DISCOUNT_LABELS}
                        >
                          <SelectTrigger className="shrink-0 px-2.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="percent">%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Tax %</Label>
                      <NumberInput
                        value={line.taxRatePct}
                        onValueChange={(v) => updateLine(line.id, { taxRatePct: v })}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-sm">
                    <span className="text-muted-foreground">Line total</span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(computed?.lineTotal ?? 0, currency)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Notes + terms */}
        <Card className="gap-0 p-5">
          <h2 className="mb-4 font-heading text-base font-semibold">Notes &amp; terms</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-terms">Payment terms</Label>
              <Textarea
                id="payment-terms"
                placeholder="e.g. Net 15 · Bank transfer to…"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Anything the customer should see on the invoice…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="gap-0 p-5">
          <h2 className="font-heading text-base font-semibold">Summary</h2>
          <div className="mt-3 flex flex-col">
            <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
            <SummaryRow
              label="Discount"
              value={`− ${formatCurrency(totals.totalDiscount, currency)}`}
            />
            <SummaryRow label="Tax" value={formatCurrency(totals.totalTax, currency)} />
            <div className="mt-2 flex items-center justify-between border-t pt-3">
              <span className="font-semibold">Grand total</span>
              <span className="font-heading text-xl font-semibold tabular-nums">
                {formatCurrency(totals.grandTotal, currency)}
              </span>
            </div>
          </div>

          <Button type="submit" className="mt-5 w-full" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Generate invoice
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Totals are recalculated on the server before saving.
          </p>
        </Card>
      </div>
    </form>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
