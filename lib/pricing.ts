/**
 * Bloom Factory pricing engine.
 *
 * Mirrors the spreadsheet model used by handmade-product makers:
 *   Material Cost  = Qty Used × Unit/Package Cost ÷ Units per Package
 *   Labor Cost     = Hourly Wage × Production Hours
 *   Base Cost      = Materials + Labor + Fixed Overhead
 *   Wholesale      = Base Cost × (1 + Wholesale Margin)
 *   Keystone       = Base Cost × 2
 *   Custom Retail  = Base Cost × (1 + Custom Retail Margin)
 *   Recommended    = max(Keystone, Custom Retail)
 *   Final Price    = Recommended ÷ (1 − Platform Fee %)
 *   Net Profit     = Final Price − Base Cost − Platform Fees
 *   Health         = Red <15% · Yellow 15–25% · Green ≥25%
 */

export type HealthStatus = "LOW" | "WATCH" | "HEALTHY"

/** Which retail price the recommendation is based on. */
export type PriceBasis = "auto" | "keystone" | "custom"

export interface MaterialLine {
  id: string
  name: string
  /** Quantity of this material consumed per finished piece. */
  qtyPerPiece: number
  /** Cost of one purchased package/unit of the material. */
  packageCost: number
  /** How many usable units come in that package. */
  unitsPerPackage: number
}

export interface OverheadLine {
  id: string
  name: string
  cost: number
}

export interface PricingInputs {
  wholesaleMargin: number
  customRetailMargin: number
  platformFeePct: number
  hourlyWage: number
  productionHours: number
  materials: MaterialLine[]
  overheads: OverheadLine[]
  /** Which retail price drives the recommendation. Defaults to "auto" (the higher of the two). */
  priceBasis?: PriceBasis
}

export interface PricingResult {
  totalMaterialCost: number
  laborCost: number
  totalOverhead: number
  baseCost: number
  wholesalePrice: number
  keystoneRetail: number
  customRetailTarget: number
  recommendedRetail: number
  /** Which of the two retail prices actually drove the recommendation. */
  resolvedBasis: "keystone" | "custom"
  finalSellingPrice: number
  platformFees: number
  netProfit: number
  netProfitMargin: number
  markupOnBase: number
  health: HealthStatus
}

const safe = (n: number): number => (Number.isFinite(n) ? n : 0)

export function materialLineCost(line: MaterialLine): number {
  if (!line.unitsPerPackage) return 0
  return safe((line.qtyPerPiece * line.packageCost) / line.unitsPerPackage)
}

export function calculatePricing(inputs: PricingInputs): PricingResult {
  const totalMaterialCost = inputs.materials.reduce(
    (sum, line) => sum + materialLineCost(line),
    0
  )

  const laborCost = safe(inputs.hourlyWage * inputs.productionHours)
  const totalOverhead = inputs.overheads.reduce(
    (sum, line) => sum + safe(line.cost),
    0
  )

  const baseCost = totalMaterialCost + laborCost + totalOverhead

  const wholesalePrice = baseCost * (1 + inputs.wholesaleMargin)
  const keystoneRetail = baseCost * 2
  const customRetailTarget = baseCost * (1 + inputs.customRetailMargin)

  const basis = inputs.priceBasis ?? "auto"
  const recommendedRetail =
    basis === "keystone"
      ? keystoneRetail
      : basis === "custom"
        ? customRetailTarget
        : Math.max(keystoneRetail, customRetailTarget)

  const feePct = Math.min(Math.max(inputs.platformFeePct, 0), 0.99)
  const finalSellingPrice = feePct >= 1 ? recommendedRetail : recommendedRetail / (1 - feePct)
  const platformFees = finalSellingPrice * feePct
  const netProfit = finalSellingPrice - baseCost - platformFees
  const netProfitMargin = finalSellingPrice ? netProfit / finalSellingPrice : 0
  const markupOnBase = baseCost ? (finalSellingPrice - baseCost) / baseCost : 0

  return {
    totalMaterialCost,
    laborCost,
    totalOverhead,
    baseCost,
    wholesalePrice,
    keystoneRetail,
    customRetailTarget,
    recommendedRetail,
    resolvedBasis: recommendedRetail === customRetailTarget ? "custom" : "keystone",
    finalSellingPrice,
    platformFees,
    netProfit,
    netProfitMargin,
    markupOnBase,
    health: healthFromMargin(netProfitMargin),
  }
}

export function healthFromMargin(margin: number): HealthStatus {
  if (margin < 0.15) return "LOW"
  if (margin < 0.25) return "WATCH"
  return "HEALTHY"
}

export const HEALTH_META: Record<
  HealthStatus,
  { label: string; tone: "destructive" | "warning" | "success"; description: string }
> = {
  LOW: {
    label: "Low profit",
    tone: "destructive",
    description: "Margin under 15%. Raise price or trim material cost.",
  },
  WATCH: {
    label: "Watch",
    tone: "warning",
    description: "Margin between 15% and 25%. Workable, but thin.",
  },
  HEALTHY: {
    label: "Healthy",
    tone: "success",
    description: "Margin at or above 25%. Comfortable cushion.",
  },
}

export function formatCurrency(value: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(safe(value))
}

export function formatPercent(value: number, digits = 1): string {
  return `${(safe(value) * 100).toFixed(digits)}%`
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function emptyMaterial(): MaterialLine {
  return { id: newId(), name: "", qtyPerPiece: 1, packageCost: 0, unitsPerPackage: 1 }
}

export function emptyOverhead(name = ""): OverheadLine {
  return { id: newId(), name, cost: 0 }
}

/** A realistic starter product so first-time users see the model working. */
export function sampleInputs(): PricingInputs {
  return {
    wholesaleMargin: 0.3,
    customRetailMargin: 0.5,
    platformFeePct: 0.05,
    hourlyWage: 250,
    productionHours: 0.75,
    materials: [
      { id: newId(), name: "Preserved roses", qtyPerPiece: 6, packageCost: 480, unitsPerPackage: 24 },
      { id: newId(), name: "Ceramic vase", qtyPerPiece: 1, packageCost: 180, unitsPerPackage: 1 },
      { id: newId(), name: "Floral foam & wire", qtyPerPiece: 1, packageCost: 90, unitsPerPackage: 4 },
      { id: newId(), name: "Ribbon & tag", qtyPerPiece: 1, packageCost: 60, unitsPerPackage: 10 },
    ],
    overheads: [
      { id: newId(), name: "Custom packaging", cost: 45 },
      { id: newId(), name: "Shipping materials", cost: 30 },
      { id: newId(), name: "Utilities / equipment wear", cost: 10 },
    ],
  }
}
