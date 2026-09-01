import assert from "node:assert/strict"
import { test } from "node:test"

import {
  canTransition,
  computeInvoice,
  computeLine,
  nextStatuses,
  round2,
  validateInvoiceDraft,
  type InvoiceDraftInput,
  type InvoiceItemInput,
} from "./invoice.js"

function item(overrides: Partial<InvoiceItemInput> = {}): InvoiceItemInput {
  return {
    description: "Widget",
    quantity: 1,
    unitPrice: 100,
    discountType: "amount",
    discountValue: 0,
    taxRatePct: 0,
    ...overrides,
  }
}

function draft(overrides: Partial<InvoiceDraftInput> = {}): InvoiceDraftInput {
  return {
    customerId: "cust-1",
    invoiceDate: "2026-08-26",
    dueDate: null,
    currency: "INR",
    status: "draft",
    notes: null,
    paymentTerms: null,
    items: [item()],
    ...overrides,
  }
}

// --- rounding -------------------------------------------------------------
test("round2 rounds half away from zero to 2 decimals", () => {
  assert.equal(round2(1.005), 1.01)
  assert.equal(round2(2.675), 2.68)
  assert.equal(round2(0.1 + 0.2), 0.3)
  assert.equal(round2(1.2345), 1.23)
})

// --- line math ------------------------------------------------------------
test("computeLine multiplies quantity by unit price", () => {
  const line = computeLine(item({ quantity: 3, unitPrice: 12.5 }))
  assert.equal(line.lineSubtotal, 37.5)
  assert.equal(line.lineTotal, 37.5)
})

test("computeLine applies an amount discount", () => {
  const line = computeLine(item({ quantity: 2, unitPrice: 100, discountValue: 30 }))
  assert.equal(line.lineSubtotal, 200)
  assert.equal(line.lineDiscount, 30)
  assert.equal(line.taxableAmount, 170)
  assert.equal(line.lineTotal, 170)
})

test("computeLine applies a percentage discount", () => {
  const line = computeLine(
    item({ quantity: 1, unitPrice: 200, discountType: "percent", discountValue: 10 })
  )
  assert.equal(line.lineDiscount, 20)
  assert.equal(line.taxableAmount, 180)
})

test("amount discount is capped at the line subtotal", () => {
  const line = computeLine(item({ quantity: 1, unitPrice: 50, discountValue: 999 }))
  assert.equal(line.lineDiscount, 50)
  assert.equal(line.taxableAmount, 0)
  assert.equal(line.lineTotal, 0)
})

test("percentage discount is capped at 100%", () => {
  const line = computeLine(
    item({ unitPrice: 100, discountType: "percent", discountValue: 250 })
  )
  assert.equal(line.lineDiscount, 100)
  assert.equal(line.taxableAmount, 0)
})

test("computeLine applies tax to the discounted amount", () => {
  const line = computeLine(
    item({ quantity: 1, unitPrice: 100, discountValue: 20, taxRatePct: 18 })
  )
  assert.equal(line.taxableAmount, 80)
  assert.equal(line.lineTax, 14.4)
  assert.equal(line.lineTotal, 94.4)
})

test("computeLine coerces negative / non-finite inputs to safe values", () => {
  const line = computeLine(
    item({ quantity: -5, unitPrice: Number.NaN, discountValue: -3, taxRatePct: -10 })
  )
  assert.equal(line.lineSubtotal, 0)
  assert.equal(line.lineTotal, 0)
})

// --- invoice totals -------------------------------------------------------
test("computeInvoice sums the rounded line values", () => {
  const totals = computeInvoice([
    item({ quantity: 2, unitPrice: 100, taxRatePct: 18 }),
    item({ quantity: 1, unitPrice: 50, discountType: "percent", discountValue: 10 }),
  ])
  assert.equal(totals.subtotal, 250)
  assert.equal(totals.totalDiscount, 5)
  assert.equal(totals.totalTax, 36)
  assert.equal(totals.grandTotal, 281)
})

test("computeInvoice of no lines is all zero", () => {
  const totals = computeInvoice([])
  assert.deepEqual(
    { s: totals.subtotal, d: totals.totalDiscount, t: totals.totalTax, g: totals.grandTotal },
    { s: 0, d: 0, t: 0, g: 0 }
  )
})

// --- validation -----------------------------------------------------------
test("a well-formed draft validates", () => {
  assert.equal(validateInvoiceDraft(draft()).ok, true)
})

test("an empty invoice is rejected", () => {
  const result = validateInvoiceDraft(draft({ items: [] }))
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((e) => /at least one line item/i.test(e)))
})

test("a missing customer is rejected", () => {
  const result = validateInvoiceDraft(draft({ customerId: null }))
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((e) => /customer/i.test(e)))
})

test("non-positive quantity is rejected", () => {
  const result = validateInvoiceDraft(draft({ items: [item({ quantity: 0 })] }))
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((e) => /quantity/i.test(e)))
})

test("negative unit price is rejected", () => {
  const result = validateInvoiceDraft(draft({ items: [item({ unitPrice: -1 })] }))
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((e) => /unit price/i.test(e)))
})

test("blank description is rejected", () => {
  const result = validateInvoiceDraft(draft({ items: [item({ description: "  " })] }))
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((e) => /description/i.test(e)))
})

test("tax rate over 100% is rejected", () => {
  const result = validateInvoiceDraft(draft({ items: [item({ taxRatePct: 120 })] }))
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((e) => /tax rate/i.test(e)))
})

test("due date before invoice date is rejected", () => {
  const result = validateInvoiceDraft(
    draft({ invoiceDate: "2026-08-26", dueDate: "2026-08-01" })
  )
  assert.equal(result.ok, false)
  assert.ok(result.errors.some((e) => /due date/i.test(e)))
})

// --- status transitions ---------------------------------------------------
test("valid status transitions are allowed", () => {
  assert.equal(canTransition("draft", "issued"), true)
  assert.equal(canTransition("issued", "paid"), true)
  assert.equal(canTransition("issued", "overdue"), true)
  assert.equal(canTransition("overdue", "paid"), true)
})

test("invalid status transitions are blocked", () => {
  assert.equal(canTransition("paid", "draft"), false)
  assert.equal(canTransition("cancelled", "issued"), false)
  assert.equal(canTransition("draft", "paid"), false)
  assert.deepEqual(nextStatuses("paid"), [])
})
