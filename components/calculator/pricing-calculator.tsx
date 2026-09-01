"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { saveProduct } from "@/lib/actions"
import {
  calculatePricing,
  emptyMaterial,
  emptyOverhead,
  formatCurrency,
  materialLineCost,
  sampleInputs,
  type MaterialLine,
  type OverheadLine,
  type PricingInputs,
} from "@/lib/pricing"
import { PRODUCT_CATEGORIES, type ProductInputs, type ProductRow } from "@/types"
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
  const sample = sampleInputs()
  return { name: "", category: PRODUCT_CATEGORIES[0], ...sample }
}

export function PricingCalculator({
  product,
  currency,
}: {
  product?: ProductRow | null
  currency: string
}) {
  const router = useRouter()
  const [state, setState] = React.useState<CalculatorState>(() => fromProduct(product))
  const [saving, startSaving] = React.useTransition()

  const inputs: PricingInputs = React.useMemo(
    () => ({
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
          </Card>

          {/* materials */}
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
              {/* header row (desktop) */}
              <div className="hidden grid-cols-[1.6fr_repeat(3,1fr)_auto] gap-3 px-5 py-2 text-xs font-medium text-muted-foreground sm:grid">
                <span>Material</span>
                <span className="text-right">Qty / piece</span>
                <span className="text-right">Pack price</span>
                <span className="text-right">Units / pack</span>
                <span className="w-8" />
              </div>
              {state.materials.map((material) => (
                <div
                  key={material.id}
                  className="grid grid-cols-2 gap-3 px-5 py-3 sm:grid-cols-[1.6fr_repeat(3,1fr)_auto] sm:items-center"
                >
                  <Input
                    className="col-span-2 sm:col-span-1"
                    placeholder="Material name"
                    value={material.name}
                    onChange={(e) => updateMaterial(material.id, { name: e.target.value })}
                  />
                  <LabeledField label="Qty">
                    <NumberInput
                      className="text-right"
                      value={material.qtyPerPiece}
                      onValueChange={(v) => updateMaterial(material.id, { qtyPerPiece: v })}
                    />
                  </LabeledField>
                  <LabeledField label="Pack price">
                    <NumberInput
                      className="text-right"
                      value={material.packageCost}
                      onValueChange={(v) => updateMaterial(material.id, { packageCost: v })}
                    />
                  </LabeledField>
                  <LabeledField label="Units / pack">
                    <NumberInput
                      className="text-right"
                      min={1}
                      value={material.unitsPerPackage}
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
            <div className="p-4">
              <Button variant="outline" size="sm" onClick={addMaterial}>
                <Plus className="size-4" /> Add material
              </Button>
            </div>
          </Card>

          {/* labor */}
          <Card className="gap-0 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-semibold">Labor &amp; time</h3>
                <p className="text-sm text-muted-foreground">Your rate times the hours per piece.</p>
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
                <Label>Production hours / piece</Label>
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
    <div className="flex items-center justify-between border-b p-5">
      <div>
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <span className="text-sm font-semibold tabular-nums">{total}</span>
    </div>
  )
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
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
