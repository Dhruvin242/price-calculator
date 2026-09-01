import type { SaleAmounts, StallRow } from "@/types"

export interface StallPnl {
  units: number
  orders: number
  revenue: number
  cogs: number
  grossProfit: number
  fixedCosts: number
  netProfit: number
  netMargin: number
  breakEvenRevenue: number
}

/**
 * Live profit & loss for a stall:
 *   Revenue    = Σ (unit price × qty)
 *   COGS       = Σ (unit cost × qty)
 *   Gross      = Revenue − COGS
 *   Fixed      = rent + other expenses
 *   Net profit = Gross − Fixed
 */
export function computeStallPnl(
  stall: Pick<StallRow, "rent" | "other_expenses">,
  sales: SaleAmounts[]
): StallPnl {
  const revenue = sales.reduce((sum, s) => sum + s.unit_price * s.quantity, 0)
  const cogs = sales.reduce((sum, s) => sum + s.unit_cost * s.quantity, 0)
  const units = sales.reduce((sum, s) => sum + s.quantity, 0)
  const grossProfit = revenue - cogs
  const fixedCosts = (stall.rent ?? 0) + (stall.other_expenses ?? 0)
  const netProfit = grossProfit - fixedCosts
  const netMargin = revenue > 0 ? netProfit / revenue : 0

  // Revenue needed to cover fixed costs at the current gross-margin rate.
  const grossMargin = revenue > 0 ? grossProfit / revenue : 0
  const breakEvenRevenue = grossMargin > 0 ? fixedCosts / grossMargin : 0

  return {
    units,
    orders: sales.length,
    revenue,
    cogs,
    grossProfit,
    fixedCosts,
    netProfit,
    netMargin,
    breakEvenRevenue,
  }
}
