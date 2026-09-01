import {
  Calculator,
  Gauge,
  Layers,
  LineChart,
  ShieldCheck,
  Tags,
  type LucideIcon,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: Calculator,
    title: "True cost, line by line",
    description:
      "Add materials with pack sizes and quantities. We compute per-unit cost the way it actually works — no mental math, no rounding surprises.",
  },
  {
    icon: Tags,
    title: "Wholesale & retail in one place",
    description:
      "Get keystone retail, custom-margin retail, and wholesale prices side by side, so you can sell through any channel without guessing.",
  },
  {
    icon: Gauge,
    title: "Margin health at a glance",
    description:
      "Every product gets a red, yellow, or green rating. Know instantly whether a price protects your profit or quietly loses you money.",
  },
  {
    icon: ShieldCheck,
    title: "Platform fees, absorbed",
    description:
      "Selling on Etsy, Shopify, or Instagram? We gross up your price so marketplace and payment fees never eat into your take-home.",
  },
  {
    icon: Layers,
    title: "A library of your products",
    description:
      "Save every arrangement, candle, or piece. Duplicate a recipe, tweak the materials, and re-price in seconds.",
  },
  {
    icon: LineChart,
    title: "Numbers you can trust",
    description:
      "Built on the exact formulas makers already use in their spreadsheets — just faster, clearer, and impossible to fat-finger.",
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to price with confidence
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Bloom Factory replaces the fragile spreadsheet with a tool built for the way
            handmade businesses actually cost and sell their work.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className={cn(
                "group relative gap-0 p-6 transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <div className="flex size-11 items-center justify-center rounded-2xl border bg-muted/50 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-heading text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
