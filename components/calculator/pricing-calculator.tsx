"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Boxes,
  Hammer,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  ShoppingBag,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { saveProduct } from "@/lib/actions"
import {
  calculatePricing,
  emptyMaterial,
  emptyOverhead,
  formatCurrency,
  materialLineCost,
  purchaseUnitCost,
  sampleInputs,
  type MaterialLine,
  type OverheadLine,
  type PricingInputs,
  type Sourcing,
} from "@/lib/pricing"
import {
  PRODUCT_CATEGORIES,
  type MaterialRow,
  type ProductInputs,
  type ProductRow,
} from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NumberInput } from "@/components/calculator/number-input"
import { ResultsPanel } from "@/components/calculator/results-panel"
import { MobileResultsBar } from "@/components/calculator/mobile-results-bar"

interface CalculatorState extends ProductInputs {
  name: string
  category: string
}

function fromProduct(product?: ProductRow | null): CalculatorState {
  if (product) {
    return {
      name: product.name,
      category: product.category ?? PRODUCT_CATEGORIES[0],
      ...product.inputs,
    }
  }
  // A new product starts with the sample margins and overheads, but no material
  // rows — makers add their own from the library instead of clearing ours.
  const sample = sampleInputs()
  return {
    name: "",
    category: PRODUCT_CATEGORIES[0],
    ...sample,
    materials: [],
    sourcing: "make",
    purchaseCost: 0,
    purchaseUnits: 1,
    purchaseSource: "",
  }
}

/** Sentinel for a material row that isn't linked to the library. */
const CUSTOM_MATERIAL = "__custom"

export function PricingCalculator({
  product,
  currency,
  library = [],
}: {
  product?: ProductRow | null
  currency: string
  /** The maker's saved materials, offered in each row's dropdown. */
  library?: MaterialRow[]
}) {
  const router = useRouter()
  const [state, setState] = React.useState<CalculatorState>(() => fromProduct(product))
  const [saving, startSaving] = React.useTransition()

  const sourcing: Sourcing = state.sourcing ?? "make"
  const isResale = sourcing === "resell"

  const inputs: PricingInputs = React.useMemo(
    () => ({
      sourcing: state.sourcing ?? "make",
      purchaseCost: state.purchaseCost ?? 0,
      purchaseUnits: state.purchaseUnits ?? 1,
      purchaseSource: state.purchaseSource ?? null,
      wholesaleMargin: state.wholesaleMargin,
      customRetailMargin: state.customRetailMargin,
      platformFeePct: state.platformFeePct,
      hourlyWage: state.hourlyWage,
      productionHours: state.productionHours,
      materials: state.materials,
      overheads: state.overheads,
      priceBasis: state.priceBasis ?? "auto",
    }),
    [state]
  )

  const result = React.useMemo(() => calculatePricing(inputs), [inputs])

  const set = <K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }))

  // ----- materials -----
  const updateMaterial = (id: string, patch: Partial<MaterialLine>) =>
    setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  const addMaterial = () =>
    setState((prev) => ({ ...prev, materials: [...prev.materials, emptyMaterial()] }))
  const removeMaterial = (id: string) =>
    setState((prev) => ({ ...prev, materials: prev.materials.filter((m) => m.id !== id) }))

  /**
   * Copies the library material's costing onto the row. The line stays a
   * snapshot from here on, so later library edits never move a saved price.
   */
  const pickMaterial = (id: string, value: string) => {
    if (value === CUSTOM_MATERIAL) {
      updateMaterial(id, { materialId: null })
      return
    }
    const item = library.find((m) => m.id === value)
    if (!item) return
    updateMaterial(id, {
      materialId: item.id,
      name: item.name,
      unit: item.unit,
      packageCost: item.package_cost,
      unitsPerPackage: item.units_per_package,
    })
  }

  // ----- overhead -----
  const updateOverhead = (id: string, patch: Partial<OverheadLine>) =>
    setState((prev) => ({
      ...prev,
      overheads: prev.overheads.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }))
  const addOverhead = () =>
    setState((prev) => ({ ...prev, overheads: [...prev.overheads, emptyOverhead()] }))
  const removeOverhead = (id: string) =>
    setState((prev) => ({ ...prev, overheads: prev.overheads.filter((o) => o.id !== id) }))

  function handleSave() {
    if (!state.name.trim()) {
      toast.error("Give your product a name before saving.")
      return
    }
    startSaving(async () => {
      const payload = {
        id: product?.id,
        name: state.name,
        category: state.category,
        inputs: {
          sourcing,
          purchaseCost: state.purchaseCost ?? 0,
          purchaseUnits: state.purchaseUnits ?? 1,
          purchaseSource: state.purchaseSource?.trim() || null,
          wholesaleMargin: state.wholesaleMargin,
          customRetailMargin: state.customRetailMargin,
          platformFeePct: state.platformFeePct,
          hourlyWage: state.hourlyWage,
          productionHours: state.productionHours,
          materials: state.materials,
          overheads: state.overheads,
          priceBasis: state.priceBasis ?? "auto",
        },
      }
      const res = await saveProduct(payload)
      if (!res.ok) {
        toast.error(res.error ?? "Could not save product")
        return
      }
      toast.success(product ? "Product updated" : "Product saved")
      if (!product && res.id) {
        router.replace(`/dashboard/calculator?id=${res.id}`)
      }
      router.refresh()
    })
  }

  function handleReset() {
    setState(fromProduct(product))
    toast.info("Reverted your changes")
  }

  const saveLabel = product ? "Save changes" : "Save product"

  return (
    <>
      {/* below lg the live price rides along at the top of the scroll instead */}
      <MobileResultsBar
        result={result}
        currency={currency}
        basis={state.priceBasis ?? "auto"}
        onBasisChange={(priceBasis) => set("priceBasis", priceBasis)}
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
        saveLabel={saveLabel}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        {/* inputs */}
        <div className="flex flex-col gap-6">
          {/* product identity */}
          <Card className="gap-0 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="product-name">Product name</Label>
                <Input
                  id="product-name"
                  placeholder="e.g. Preserved rose arrangement"
                  value={state.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select value={state.category} onValueChange={(v) => set("category", v as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <Label>Where it comes from</Label>
              <SourcingToggle value={sourcing} onChange={(v) => set("sourcing", v)} />
              <p className="text-xs text-muted-foreground">
                {isResale
                  ? "Priced from what you paid a supplier, plus your own margin."
                  : "Priced from your materials, labor and overhead."}
              </p>
            </div>
          </Card>

          {/* bought-in cost (resale) */}
          {isResale && (
            <Card className="gap-0 p-0">
              <SectionHeader
                title="Bought-in cost"
                subtitle="What one finished piece costs you"
                total={formatCurrency(purchaseUnitCost(inputs), currency)}
              />
              <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <div className="flex flex-col gap-1.5">
                  <Label>What you paid</Label>
                  <NumberInput
                    className="text-right"
                    value={state.purchaseCost ?? 0}
                    onValueChange={(v) => set("purchaseCost", v)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Pieces that covers</Label>
                  <NumberInput
                    className="text-right"
                    min={0}
                    value={state.purchaseUnits ?? 1}
                    onValueChange={(v) => set("purchaseUnits", v)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="purchase-source">Bought from</Label>
                  <Input
                    id="purchase-source"
                    placeholder="Supplier, wholesaler or the maker"
                    value={state.purchaseSource ?? ""}
                    onChange={(e) => set("purchaseSource", e.target.value)}
                  />
                </div>
              </div>
              <p className="border-t px-4 py-3 text-xs text-muted-foreground sm:px-5">
                Bought a lot? Enter the lot price and how many sellable pieces it covers.
                Freight, repacking and commission belong in Overhead below.
              </p>
            </Card>
          )}

          {/* materials */}
          {!isResale && (
          <Card className="gap-0 p-0">
            <SectionHeader
              title="Direct materials"
              subtitle="Cost = quantity × pack price ÷ units per pack"
              total={formatCurrency(
                state.materials.reduce((s, m) => s + materialLineCost(m), 0),
                currency
              )}
            />
            <div className="divide-y">
              {state.materials.length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                  No materials yet. Add one below
                  {library.length > 0 ? " and pick it from your library." : "."}
                </p>
              )}
              {/* header row (desktop) */}
              {state.materials.length > 0 && (
                <div className="hidden grid-cols-[1.6fr_repeat(3,1fr)_auto] gap-3 px-5 py-2 text-xs font-medium text-muted-foreground sm:grid">
                  <span>Material</span>
                  <span className="text-right">Qty / piece</span>
                  <span className="text-right">Pack price</span>
                  <span className="text-right">Units / pack</span>
                  <span className="w-8" />
                </div>
              )}
              {state.materials.map((material) => (
                <div
                  key={material.id}
                  className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[1.6fr_repeat(3,1fr)_auto] sm:items-center sm:gap-3 sm:px-5"
                >
                  <MaterialPicker
                    material={material}
                    library={library}
                    currency={currency}
                    onPick={(value) => pickMaterial(material.id, value)}
                    onRename={(name) => updateMaterial(material.id, { name })}
                  />
                  <LabeledField label="Qty">
                    <NumberInput
                      className="text-right"
                      value={material.qtyPerPiece}
                      onValueChange={(v) => updateMaterial(material.id, { qtyPerPiece: v })}
                    />
                  </LabeledField>
                  <LabeledField
                    label="Pack price"
                    className={isLinked(material, library) ? "hidden sm:flex" : undefined}
                  >
                    <NumberInput
                      className="text-right"
                      value={material.packageCost}
                      disabled={isLinked(material, library)}
                      title={
                        isLinked(material, library)
                          ? "Set by the materials library"
                          : undefined
                      }
                      onValueChange={(v) => updateMaterial(material.id, { packageCost: v })}
                    />
                  </LabeledField>
                  <LabeledField
                    label="Units / pack"
                    className={isLinked(material, library) ? "hidden sm:flex" : undefined}
                  >
                    <NumberInput
                      className="text-right"
                      min={1}
                      value={material.unitsPerPackage}
                      disabled={isLinked(material, library)}
                      title={
                        isLinked(material, library)
                          ? "Set by the materials library"
                          : undefined
                      }
                      onValueChange={(v) => updateMaterial(material.id, { unitsPerPackage: v })}
                    />
                  </LabeledField>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium tabular-nums sm:hidden">
                      {formatCurrency(materialLineCost(material), currency)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove material"
                      onClick={() => removeMaterial(material.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
              <Button variant="outline" size="sm" onClick={addMaterial}>
                <Plus className="size-4" /> Add material
              </Button>
              <Link
                href="/dashboard/materials"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Boxes className="size-3.5" />
                {library.length > 0
                  ? "Manage materials library"
                  : "Save materials once, reuse them here"}
              </Link>
            </div>
          </Card>
          )}

          {/* labor */}
          <Card className="gap-0 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-semibold">
                  {isResale ? "Handling time" : "Labor & time"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isResale
                    ? "Your rate times the time spent listing and packing a piece."
                    : "Your rate times the hours per piece."}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(state.hourlyWage * state.productionHours, currency)}
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Hourly rate</Label>
                <NumberInput
                  value={state.hourlyWage}
                  onValueChange={(v) => set("hourlyWage", v)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{isResale ? "Handling hours / piece" : "Production hours / piece"}</Label>
                <NumberInput
                  value={state.productionHours}
                  onValueChange={(v) => set("productionHours", v)}
                />
              </div>
            </div>
          </Card>

          {/* overhead */}
          <Card className="gap-0 p-0">
            <SectionHeader
              title="Overhead"
              subtitle="Packaging, shipping materials, utilities, and wear."
              total={formatCurrency(
                state.overheads.reduce((s, o) => s + o.cost, 0),
                currency
              )}
            />
            <div className="divide-y">
              {state.overheads.map((overhead) => (
                <div key={overhead.id} className="flex items-center gap-3 px-5 py-3">
                  <Input
                    className="flex-1"
                    placeholder="Expense name"
                    value={overhead.name}
                    onChange={(e) => updateOverhead(overhead.id, { name: e.target.value })}
                  />
                  <NumberInput
                    className="w-28 text-right"
                    value={overhead.cost}
                    onValueChange={(v) => updateOverhead(overhead.id, { cost: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove expense"
                    onClick={() => removeOverhead(overhead.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="p-4">
              <Button variant="outline" size="sm" onClick={addOverhead}>
                <Plus className="size-4" /> Add expense
              </Button>
            </div>
          </Card>

          {/* pricing settings */}
          <Card className="gap-0 p-5">
            <h3 className="font-heading text-base font-semibold">Pricing settings</h3>
            <p className="text-sm text-muted-foreground">Margins and fees, as percentages.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <PercentField
                label="Wholesale margin"
                value={state.wholesaleMargin}
                onChange={(v) => set("wholesaleMargin", v)}
              />
              <PercentField
                label="Custom retail margin"
                value={state.customRetailMargin}
                onChange={(v) => set("customRetailMargin", v)}
              />
              <PercentField
                label="Platform / payment fee"
                value={state.platformFeePct}
                onChange={(v) => set("platformFeePct", v)}
              />
            </div>
          </Card>
        </div>

        {/* results (sticky) */}
        <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <ResultsPanel
            result={result}
            currency={currency}
            basis={state.priceBasis ?? "auto"}
            onBasisChange={(priceBasis) => set("priceBasis", priceBasis)}
          />
          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saveLabel}
            </Button>
            <Button variant="ghost" onClick={handleReset} className="w-full">
              <RotateCcw className="size-4" /> Reset
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

/** Segmented control for how the product is sourced. */
function SourcingToggle({
  value,
  onChange,
}: {
  value: Sourcing
  onChange: (value: Sourcing) => void
}) {
  const options: { value: Sourcing; label: string; icon: LucideIcon }[] = [
    { value: "make", label: "I make it", icon: Hammer },
    { value: "resell", label: "I buy & resell", icon: ShoppingBag },
  ]

  return (
    <div className="inline-flex w-full rounded-full border bg-background/50 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <option.icon className="size-4" />
          {option.label}
        </button>
      ))}
    </div>
  )
}

/**
 * True when the line still points at a material that exists in the library —
 * its costing is then owned by the library and locked in the calculator.
 * A material deleted from the library falls back to a free-text line.
 */
function isLinked(material: MaterialLine, library: MaterialRow[]) {
  return Boolean(material.materialId) && library.some((m) => m.id === material.materialId)
}

/**
 * The material name cell: a dropdown of the maker's saved materials, falling
 * back to a free-text name for one-off (or library-deleted) lines.
 */
function MaterialPicker({
  material,
  library,
  currency,
  onPick,
  onRename,
}: {
  material: MaterialLine
  library: MaterialRow[]
  currency: string
  onPick: (value: string) => void
  onRename: (name: string) => void
}) {
  const linked = isLinked(material, library) ? material.materialId! : CUSTOM_MATERIAL

  if (library.length === 0) {
    return (
      <Input
        className="col-span-2 sm:col-span-1"
        placeholder="Material name"
        value={material.name}
        onChange={(e) => onRename(e.target.value)}
      />
    )
  }

  return (
    <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
      <Select value={linked} onValueChange={(v) => onPick(v as string)}>
        <SelectTrigger className="w-full">
          {/* the value is a material id — render its name instead */}
          <SelectValue>
            {(value: string) =>
              library.find((m) => m.id === value)?.name ?? "Custom material"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={CUSTOM_MATERIAL}>Custom material</SelectItem>
          {library.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {linked === CUSTOM_MATERIAL ? (
        <Input
          placeholder="Material name"
          value={material.name}
          onChange={(e) => onRename(e.target.value)}
        />
      ) : (
        // the pack fields are hidden on phones for a linked line, so restate
        // the costing the library is supplying
        <p className="text-xs text-muted-foreground tabular-nums sm:hidden">
          {formatCurrency(material.packageCost, currency)} / {material.unitsPerPackage}{" "}
          {material.unit ?? "units"}
        </p>
      )}
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
  total,
}: {
  title: string
  subtitle: string
  total: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b p-4 sm:p-5">
      <div>
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <span className="text-sm font-semibold tabular-nums">{total}</span>
    </div>
  )
}

function LabeledField({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs text-muted-foreground sm:hidden">{label}</span>
      {children}
    </div>
  )
}

/** Presents a fractional margin (0.3) as a percentage (30) with a % suffix. */
function PercentField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <NumberInput
          className="pr-7 text-right"
          value={Math.round(value * 1000) / 10}
          onValueChange={(v) => onChange(v / 100)}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          %
        </span>
      </div>
    </div>
  )
}
