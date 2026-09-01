/**
 * Bloom Factory invoice engine.
 *
 * Pure, dependency-free money math and validation for invoices — the single
 * source of truth for line and invoice totals. Server actions call this before
 * persisting so stored columns always match the model; the UI calls it for live
 * feedback. Keep this file pure: no React, no Supabase (mirrors lib/pricing.ts).
 *
 * Money model (per line):
 *   lineSubtotal   = quantity × unitPrice
 *   lineDiscount   = percent → subtotal × rate ; amount → min(value, subtotal)
 *   taxableAmount  = subtotal − discount
 *   lineTax        = taxableAmount × taxRate
 *   lineTotal      = taxableAmount + tax
 *
 * Invoice totals are the sums of the (already rounded) line values, so the
 * printed breakdown always reconciles to the grand total.
 *
 * Rounding: every monetary value is rounded to 2 decimal places, half away from
 * zero (round2). Rounding is applied per line component, then summed — this
 * keeps each displayed line internally consistent and avoids drift between the
 * line list and the totals.
 */

export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "cancelled"

export type DiscountType = "amount" | "percent"

/** Raw, user-editable shape of a single invoice line. */
export interface InvoiceItemInput {
  description: string
  quantity: number
  unitPrice: number
  discountType: DiscountType
  /** Percent (0–100) when discountType is "percent"; absolute amount otherwise. */
  discountValue: number
  /** Tax rate as a percentage, e.g. 18 for 18%. */
  taxRatePct: number
}

/** A line with all derived money fields resolved. */
export interface ComputedLine extends InvoiceItemInput {
  lineSubtotal: number
  lineDiscount: number
  taxableAmount: number
  lineTax: number
  lineTotal: number
}

export interface InvoiceTotals {
  lines: ComputedLine[]
  subtotal: number
  totalDiscount: number
  totalTax: number
  grandTotal: number
}

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "issued",
  "paid",
  "overdue",
  "cancelled",
]

export const MAX_NOTES_LENGTH = 2000
export const MAX_DESCRIPTION_LENGTH = 200
export const MAX_TERMS_LENGTH = 500

const safe = (n: number): number => (Number.isFinite(n) ? n : 0)

/**
 * Round to 2 decimals, half away from zero. Uses the decimal-string exponent
 * form so values like 1.005 round to 1.01 (multiplying by 100 in float yields
 * 100.4999… and would round down).
 */
export function round2(value: number): number {
  const n = safe(value)
  const sign = n < 0 ? -1 : 1
  const rounded = Math.round(Number(`${Math.abs(n)}e2`)) / 100
  return sign * rounded
}

export function computeLine(item: InvoiceItemInput): ComputedLine {
  const quantity = Math.max(0, safe(item.quantity))
  const unitPrice = Math.max(0, safe(item.unitPrice))
  const lineSubtotal = round2(quantity * unitPrice)

  const discountValue = Math.max(0, safe(item.discountValue))
  const rawDiscount =
    item.discountType === "percent"
      ? lineSubtotal * (Math.min(discountValue, 100) / 100)
      : Math.min(discountValue, lineSubtotal)
  const lineDiscount = round2(Math.min(Math.max(rawDiscount, 0), lineSubtotal))

  const taxableAmount = round2(lineSubtotal - lineDiscount)
  const taxRatePct = Math.max(0, safe(item.taxRatePct))
  const lineTax = round2(taxableAmount * (taxRatePct / 100))
  const lineTotal = round2(taxableAmount + lineTax)

  return {
    description: item.description,
    quantity,
    unitPrice,
    discountType: item.discountType,
    discountValue,
    taxRatePct,
    lineSubtotal,
    lineDiscount,
    taxableAmount,
    lineTax,
    lineTotal,
  }
}

export function computeInvoice(items: InvoiceItemInput[]): InvoiceTotals {
  const lines = items.map(computeLine)
  const subtotal = round2(lines.reduce((sum, l) => sum + l.lineSubtotal, 0))
  const totalDiscount = round2(lines.reduce((sum, l) => sum + l.lineDiscount, 0))
  const totalTax = round2(lines.reduce((sum, l) => sum + l.lineTax, 0))
  const grandTotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0))
  return { lines, subtotal, totalDiscount, totalTax, grandTotal }
}

// ---------------------------------------------------------------------------
// Status transitions
// ---------------------------------------------------------------------------
const TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["issued", "cancelled"],
  issued: ["paid", "overdue", "cancelled"],
  overdue: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
}

export function nextStatuses(from: InvoiceStatus): InvoiceStatus[] {
  return TRANSITIONS[from] ?? []
}

export function canTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  if (from === to) return true
  return nextStatuses(from).includes(to)
}

export const STATUS_META: Record<
  InvoiceStatus,
  { label: string; tone: "default" | "secondary" | "success" | "warning" | "destructive" }
> = {
  draft: { label: "Draft", tone: "secondary" },
  issued: { label: "Issued", tone: "default" },
  paid: { label: "Paid", tone: "success" },
  overdue: { label: "Overdue", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "destructive" },
}

// ---------------------------------------------------------------------------
// Validation (shared by the client for early feedback and the server as the
// authority). Returns human-readable messages, never throws.
// ---------------------------------------------------------------------------
export interface InvoiceDraftInput {
  customerId: string | null
  invoiceDate: string
  dueDate: string | null
  currency: string
  status: InvoiceStatus
  notes: string | null
  paymentTerms: string | null
  items: InvoiceItemInput[]
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const d = new Date(`${value}T00:00:00`)
  return !Number.isNaN(d.getTime())
}

/** Number has at most `places` decimal places. */
function withinPrecision(value: number, places: number): boolean {
  const factor = 10 ** places
  return Math.abs(Math.round(value * factor) - value * factor) < 1e-6
}

export function validateInvoiceDraft(input: InvoiceDraftInput): {
  ok: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!input.customerId) errors.push("Select a customer for this invoice.")

  if (!input.invoiceDate || !isValidDate(input.invoiceDate)) {
    errors.push("Enter a valid invoice date.")
  }
  if (input.dueDate) {
    if (!isValidDate(input.dueDate)) {
      errors.push("Enter a valid due date.")
    } else if (isValidDate(input.invoiceDate) && input.dueDate < input.invoiceDate) {
      errors.push("Due date cannot be before the invoice date.")
    }
  }

  if (!input.currency || !/^[A-Za-z]{3}$/.test(input.currency)) {
    errors.push("Currency must be a 3-letter code.")
  }

  if (!INVOICE_STATUSES.includes(input.status)) {
    errors.push("Invalid invoice status.")
  }

  if (input.notes && input.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`)
  }
  if (input.paymentTerms && input.paymentTerms.length > MAX_TERMS_LENGTH) {
    errors.push(`Payment terms must be ${MAX_TERMS_LENGTH} characters or fewer.`)
  }

  if (!input.items || input.items.length === 0) {
    errors.push("Add at least one line item.")
  }

  input.items?.forEach((item, i) => {
    const n = i + 1
    if (!item.description || !item.description.trim()) {
      errors.push(`Line ${n}: description is required.`)
    } else if (item.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`Line ${n}: description is too long.`)
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      errors.push(`Line ${n}: quantity must be greater than zero.`)
    } else if (item.quantity > 1_000_000 || !withinPrecision(item.quantity, 3)) {
      errors.push(`Line ${n}: quantity is invalid.`)
    }
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      errors.push(`Line ${n}: unit price must be zero or more.`)
    } else if (item.unitPrice > 100_000_000 || !withinPrecision(item.unitPrice, 2)) {
      errors.push(`Line ${n}: unit price is invalid.`)
    }
    if (!Number.isFinite(item.discountValue) || item.discountValue < 0) {
      errors.push(`Line ${n}: discount must be zero or more.`)
    } else if (item.discountType === "percent" && item.discountValue > 100) {
      errors.push(`Line ${n}: percentage discount cannot exceed 100%.`)
    }
    if (!Number.isFinite(item.taxRatePct) || item.taxRatePct < 0 || item.taxRatePct > 100) {
      errors.push(`Line ${n}: tax rate must be between 0 and 100%.`)
    }
  })

  return { ok: errors.length === 0, errors }
}
