"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/server"
import { calculatePricing } from "@/lib/pricing"
import {
  canTransition,
  computeInvoice,
  validateInvoiceDraft,
  type DiscountType,
  type InvoiceItemInput,
  type InvoiceStatus,
} from "@/lib/invoice"
import type { ProductInputs } from "@/types"

export interface ActionResult {
  ok: boolean
  error?: string
  id?: string
}

export interface SaveProductPayload {
  id?: string
  name: string
  category: string | null
  inputs: ProductInputs
}

export async function saveProduct(payload: SaveProductPayload): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const name = payload.name.trim()
  if (!name) return { ok: false, error: "Product name is required." }

  const result = calculatePricing(payload.inputs)

  const record = {
    user_id: user.id,
    name,
    category: payload.category,
    inputs: payload.inputs,
    base_cost: round(result.baseCost),
    recommended_price: round(result.finalSellingPrice),
    net_profit: round(result.netProfit),
    net_margin: round(result.netProfitMargin, 4),
    health: result.health,
  }

  if (payload.id) {
    const { error } = await supabase
      .from("products")
      .update(record)
      .eq("id", payload.id)
      .eq("user_id", user.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/products")
    return { ok: true, id: payload.id }
  }

  const { data, error } = await supabase
    .from("products")
    .insert(record)
    .select("id")
    .single()
  if (error) return { ok: false, error: error.message }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/products")
  return { ok: true, id: data.id as string }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/products")
  return { ok: true }
}

export interface UpdateProfilePayload {
  full_name: string
  business_name: string
  currency: string
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: payload.full_name.trim() || null,
      business_name: payload.business_name.trim() || null,
      currency: payload.currency,
    })
    .eq("id", user.id)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/dashboard", "layout")
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Stalls
// ---------------------------------------------------------------------------
export interface StallPayload {
  id?: string
  name: string
  event_date: string | null
  location: string | null
  rent: number
  other_expenses: number
  notes: string | null
}

export async function saveStall(payload: StallPayload): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const name = payload.name.trim()
  if (!name) return { ok: false, error: "Stall name is required." }

  const record = {
    user_id: user.id,
    name,
    event_date: payload.event_date || null,
    location: payload.location?.trim() || null,
    rent: Number.isFinite(payload.rent) ? payload.rent : 0,
    other_expenses: Number.isFinite(payload.other_expenses) ? payload.other_expenses : 0,
    notes: payload.notes?.trim() || null,
  }

  if (payload.id) {
    const { error } = await supabase
      .from("stalls")
      .update(record)
      .eq("id", payload.id)
      .eq("user_id", user.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath("/dashboard/stalls")
    revalidatePath(`/dashboard/stalls/${payload.id}`)
    return { ok: true, id: payload.id }
  }

  const { data, error } = await supabase.from("stalls").insert(record).select("id").single()
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/stalls")
  return { ok: true, id: data.id as string }
}

export async function deleteStall(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const { error } = await supabase.from("stalls").delete().eq("id", id).eq("user_id", user.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/stalls")
  return { ok: true }
}

export interface SalePayload {
  stall_id: string
  product_id: string | null
  product_name: string
  unit_price: number
  unit_cost: number
  quantity: number
}

export async function addSale(payload: SalePayload): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const name = payload.product_name.trim()
  if (!name) return { ok: false, error: "Choose or name a product." }
  const quantity = Math.max(1, Math.round(payload.quantity || 1))

  const { error } = await supabase.from("stall_sales").insert({
    stall_id: payload.stall_id,
    user_id: user.id,
    product_id: payload.product_id,
    product_name: name,
    unit_price: round(payload.unit_price),
    unit_cost: round(payload.unit_cost),
    quantity,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/dashboard/stalls/${payload.stall_id}`)
  revalidatePath("/dashboard/stalls")
  return { ok: true }
}

export async function deleteSale(id: string, stallId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const { error } = await supabase
    .from("stall_sales")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/dashboard/stalls/${stallId}`)
  revalidatePath("/dashboard/stalls")
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Materials library
// ---------------------------------------------------------------------------
export interface MaterialPayload {
  id?: string
  name: string
  unit: string
  package_cost: number
  units_per_package: number
  supplier: string | null
  notes: string | null
}

export async function saveMaterial(payload: MaterialPayload): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const name = payload.name.trim()
  if (!name) return { ok: false, error: "Material name is required." }
  if (!(payload.units_per_package > 0)) {
    return { ok: false, error: "Units per pack must be greater than zero." }
  }

  const record = {
    user_id: user.id,
    name,
    unit: payload.unit,
    package_cost: round(payload.package_cost),
    units_per_package: round(payload.units_per_package, 3),
    supplier: payload.supplier?.trim() || null,
    notes: payload.notes?.trim() || null,
  }

  if (payload.id) {
    const { error } = await supabase
      .from("materials")
      .update(record)
      .eq("id", payload.id)
      .eq("user_id", user.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath("/dashboard/materials")
    revalidatePath("/dashboard/calculator")
    return { ok: true, id: payload.id }
  }

  const { data, error } = await supabase
    .from("materials")
    .insert(record)
    .select("id")
    .single()
  if (error) return { ok: false, error: error.message }

  revalidatePath("/dashboard/materials")
  revalidatePath("/dashboard/calculator")
  return { ok: true, id: data.id as string }
}

export async function deleteMaterial(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/dashboard/materials")
  revalidatePath("/dashboard/calculator")
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export interface CustomerPayload {
  id?: string
  name: string
  email: string | null
  phone: string | null
  billing_address: string | null
  notes: string | null
}

export async function saveCustomer(payload: CustomerPayload): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const name = payload.name.trim()
  if (!name) return { ok: false, error: "Customer name is required." }

  const email = payload.email?.trim() || null
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." }
  }

  const record = {
    user_id: user.id,
    name,
    email,
    phone: payload.phone?.trim() || null,
    billing_address: payload.billing_address?.trim() || null,
    notes: payload.notes?.trim() || null,
  }

  if (payload.id) {
    const { error } = await supabase
      .from("customers")
      .update(record)
      .eq("id", payload.id)
      .eq("user_id", user.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath("/dashboard/customers")
    return { ok: true, id: payload.id }
  }

  const { data, error } = await supabase
    .from("customers")
    .insert(record)
    .select("id")
    .single()
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/customers")
  return { ok: true, id: data.id as string }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/customers")
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------
export interface InvoiceItemPayload {
  description: string
  quantity: number
  unitPrice: number
  discountType: DiscountType
  discountValue: number
  taxRatePct: number
}

export interface CreateInvoicePayload {
  customerId: string
  invoiceDate: string
  dueDate: string | null
  currency: string
  status: InvoiceStatus
  notes: string | null
  paymentTerms: string | null
  items: InvoiceItemPayload[]
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  // Invoices can only be created as draft or issued; later states are transitions.
  if (payload.status !== "draft" && payload.status !== "issued") {
    return { ok: false, error: "New invoices must be a draft or issued." }
  }

  const items: InvoiceItemInput[] = payload.items.map((i) => ({
    description: i.description.trim(),
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    discountType: i.discountType,
    discountValue: i.discountValue,
    taxRatePct: i.taxRatePct,
  }))

  const validation = validateInvoiceDraft({
    customerId: payload.customerId,
    invoiceDate: payload.invoiceDate,
    dueDate: payload.dueDate,
    currency: payload.currency,
    status: payload.status,
    notes: payload.notes,
    paymentTerms: payload.paymentTerms,
    items,
  })
  if (!validation.ok) return { ok: false, error: validation.errors[0] }

  // Authorization: the customer must belong to the caller.
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("id", payload.customerId)
    .eq("user_id", user.id)
    .maybeSingle()
  if (!customer) return { ok: false, error: "Customer not found." }

  // Server is authoritative: recompute every monetary value.
  const totals = computeInvoice(items)

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", user.id)
    .maybeSingle()

  const rpcPayload = {
    customer_id: payload.customerId,
    status: payload.status,
    issue_date: payload.invoiceDate,
    due_date: payload.dueDate ?? "",
    currency: payload.currency.toUpperCase(),
    notes: payload.notes ?? "",
    payment_terms: payload.paymentTerms ?? "",
    business_name: (profile?.business_name as string | null) ?? "",
    subtotal: totals.subtotal,
    total_discount: totals.totalDiscount,
    total_tax: totals.totalTax,
    grand_total: totals.grandTotal,
  }

  const rpcItems = totals.lines.map((line) => ({
    description: line.description,
    quantity: line.quantity,
    unit_price: line.unitPrice,
    discount_type: line.discountType,
    discount_value: line.discountValue,
    tax_rate_pct: line.taxRatePct,
    line_subtotal: line.lineSubtotal,
    line_discount: line.lineDiscount,
    line_tax: line.lineTax,
    line_total: line.lineTotal,
  }))

  const { data, error } = await supabase.rpc("create_invoice", {
    payload: rpcPayload,
    items: rpcItems,
  })
  if (error) {
    console.error("createInvoice failed", error)
    return { ok: false, error: "Could not generate the invoice. Please try again." }
  }

  const created = Array.isArray(data) ? data[0] : data
  const id = (created?.id as string | undefined) ?? undefined

  revalidatePath("/dashboard/invoices")
  revalidatePath("/dashboard")
  return { ok: true, id }
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const { data: current } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()
  if (!current) return { ok: false, error: "Invoice not found." }

  if (!canTransition(current.status as InvoiceStatus, status)) {
    return { ok: false, error: `Cannot change status from ${current.status} to ${status}.` }
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/dashboard/invoices")
  revalidatePath(`/dashboard/invoices/${id}`)
  return { ok: true, id }
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "You must be logged in." }

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/invoices")
  return { ok: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round((Number.isFinite(value) ? value : 0) * factor) / factor
}
