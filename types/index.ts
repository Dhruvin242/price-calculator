import type { MaterialLine, OverheadLine, HealthStatus, PriceBasis } from "@/lib/pricing"
import type { DiscountType, InvoiceStatus } from "@/lib/invoice"

export interface ProfileRow {
  id: string
  full_name: string | null
  business_name: string | null
  avatar_url: string | null
  currency: string
  created_at: string
  updated_at: string
}

/** Shape of the JSON persisted in `products.inputs`. */
export interface ProductInputs {
  wholesaleMargin: number
  customRetailMargin: number
  platformFeePct: number
  hourlyWage: number
  productionHours: number
  materials: MaterialLine[]
  overheads: OverheadLine[]
  priceBasis?: PriceBasis
}

export interface ProductRow {
  id: string
  user_id: string
  name: string
  category: string | null
  inputs: ProductInputs
  base_cost: number
  recommended_price: number
  net_profit: number
  net_margin: number
  health: HealthStatus
  created_at: string
  updated_at: string
}

export type ProductInsert = Omit<ProductRow, "id" | "created_at" | "updated_at">

export interface StallRow {
  id: string
  user_id: string
  name: string
  event_date: string | null
  location: string | null
  rent: number
  other_expenses: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface StallSaleRow {
  id: string
  stall_id: string
  user_id: string
  product_id: string | null
  product_name: string
  unit_price: number
  unit_cost: number
  quantity: number
  created_at: string
}

export interface StallWithSales extends StallRow {
  stall_sales: StallSaleRow[]
}

export type SaleAmounts = Pick<StallSaleRow, "unit_price" | "unit_cost" | "quantity">

export interface StallListItem extends StallRow {
  stall_sales: SaleAmounts[]
}

// ---------------------------------------------------------------------------
// Materials library
// ---------------------------------------------------------------------------
export interface MaterialRow {
  id: string
  user_id: string
  name: string
  unit: string
  package_cost: number
  units_per_package: number
  supplier: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

/** Units a material can be measured in. Free-form on the DB side. */
export const MATERIAL_UNITS = [
  "piece",
  "gram",
  "kg",
  "ml",
  "litre",
  "metre",
  "sheet",
  "pack",
  "set",
] as const

export type MaterialUnit = (typeof MATERIAL_UNITS)[number]

// ---------------------------------------------------------------------------
// Customers & invoices
// ---------------------------------------------------------------------------
export interface CustomerRow {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  billing_address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceRow {
  id: string
  user_id: string
  customer_id: string | null
  invoice_number: string
  status: InvoiceStatus
  issue_date: string
  due_date: string | null
  currency: string
  notes: string | null
  payment_terms: string | null
  customer_name: string
  customer_email: string | null
  customer_billing_address: string | null
  business_name: string | null
  subtotal: number
  total_discount: number
  total_tax: number
  grand_total: number
  created_at: string
  updated_at: string
}

export interface InvoiceItemRow {
  id: string
  invoice_id: string
  user_id: string
  position: number
  description: string
  quantity: number
  unit_price: number
  discount_type: DiscountType
  discount_value: number
  tax_rate_pct: number
  line_subtotal: number
  line_discount: number
  line_tax: number
  line_total: number
  created_at: string
}

export interface InvoiceWithItems extends InvoiceRow {
  invoice_items: InvoiceItemRow[]
}

/** Row shape for the invoice list table (no line items joined). */
export type InvoiceListItem = InvoiceRow

export const PRODUCT_CATEGORIES = [
  "Floral arrangement",
  "Bouquet",
  "Home decor",
  "Jewelry",
  "Candles",
  "Stationery",
  "Gifting",
  "Other",
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
