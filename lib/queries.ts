import "server-only"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/server"
import type {
  CustomerRow,
  MaterialRow,
  InvoiceListItem,
  InvoiceWithItems,
  ProductRow,
  ProfileRow,
  StallListItem,
  StallWithSales,
} from "@/types"
import type { InvoiceStatus } from "@/lib/invoice"

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getUser()
  if (!user) redirect("/login")
  return user
}

/** Reads the caller's profile, creating a bare row if the trigger hasn't run. */
export async function getProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (data) return data as ProfileRow

  const fallback = {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string) ?? null,
    business_name: null,
    avatar_url: null,
    currency: "INR",
  }
  const { data: created } = await supabase
    .from("profiles")
    .upsert(fallback, { onConflict: "id" })
    .select("*")
    .maybeSingle()

  return (created as ProfileRow) ?? null
}

export async function getProducts(): Promise<ProductRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) throw error
  return (data as ProductRow[]) ?? []
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle()
  return (data as ProductRow) ?? null
}

export async function getStalls(): Promise<StallListItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stalls")
    .select("*, stall_sales(unit_price, unit_cost, quantity)")
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as StallListItem[]) ?? []
}

export async function getStall(id: string): Promise<StallWithSales | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("stalls")
    .select("*, stall_sales(*)")
    .eq("id", id)
    .maybeSingle()

  if (!data) return null
  const stall = data as StallWithSales
  stall.stall_sales = (stall.stall_sales ?? []).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )
  return stall
}

// ---------------------------------------------------------------------------
// Materials library
// ---------------------------------------------------------------------------
export async function getMaterials(): Promise<MaterialRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw error
  return (data as MaterialRow[]) ?? []
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export async function getCustomers(): Promise<CustomerRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw error
  return (data as CustomerRow[]) ?? []
}

export async function getCustomer(id: string): Promise<CustomerRow | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("customers").select("*").eq("id", id).maybeSingle()
  return (data as CustomerRow) ?? null
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------
export const INVOICE_PAGE_SIZE = 25

export interface InvoiceListFilters {
  status?: InvoiceStatus
  search?: string
  page?: number
}

export interface InvoiceListResult {
  invoices: InvoiceListItem[]
  total: number
  page: number
  pageSize: number
}

/** Server-side paginated invoice list (never loads an unbounded set). */
export async function getInvoices(
  filters: InvoiceListFilters = {}
): Promise<InvoiceListResult> {
  const supabase = await createClient()
  const page = Math.max(1, filters.page ?? 1)
  const from = (page - 1) * INVOICE_PAGE_SIZE
  const to = from + INVOICE_PAGE_SIZE - 1

  let query = supabase
    .from("invoices")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (filters.status) query = query.eq("status", filters.status)
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`invoice_number.ilike.${term},customer_name.ilike.${term}`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return {
    invoices: (data as InvoiceListItem[]) ?? [],
    total: count ?? 0,
    page,
    pageSize: INVOICE_PAGE_SIZE,
  }
}

export async function getInvoice(id: string): Promise<InvoiceWithItems | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .maybeSingle()

  if (!data) return null
  const invoice = data as InvoiceWithItems
  invoice.invoice_items = (invoice.invoice_items ?? []).sort((a, b) => a.position - b.position)
  return invoice
}

export interface DashboardStats {
  productCount: number
  avgMargin: number
  totalPotentialProfit: number
  healthyShare: number
}

export function computeStats(products: ProductRow[]): DashboardStats {
  if (products.length === 0) {
    return { productCount: 0, avgMargin: 0, totalPotentialProfit: 0, healthyShare: 0 }
  }
  const avgMargin =
    products.reduce((sum, p) => sum + p.net_margin, 0) / products.length
  const totalPotentialProfit = products.reduce((sum, p) => sum + p.net_profit, 0)
  const healthy = products.filter((p) => p.health === "HEALTHY").length
  return {
    productCount: products.length,
    avgMargin,
    totalPotentialProfit,
    healthyShare: healthy / products.length,
  }
}
