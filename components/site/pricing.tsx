import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Plan {
  name: string
  price: string
  cadence?: string
  description: string
  features: string[]
  cta: string
  href: string
  highlighted?: boolean
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    cadence: "forever",
    description: "For makers finding their first honest price.",
    features: [
      "Up to 5 saved products",
      "Full pricing calculator",
      "Wholesale & retail pricing",
      "Margin-health ratings",
    ],
    cta: "Start free",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "₹499",
    cadence: "/ month",
    description: "For growing shops selling across channels.",
    features: [
      "Unlimited saved products",
      "Duplicate & re-price recipes",
      "Platform-fee gross-up",
      "Custom margin targets",
      "Priority email support",
    ],
    cta: "Start Pro trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Business",
    price: "₹1,499",
    cadence: "/ month",
    description: "For studios and teams pricing at scale.",
    features: [
      "Everything in Pro",
      "Multiple product catalogs",
      "Team members & roles",
      "Bulk import & export",
      "Dedicated onboarding",
    ],
    cta: "Talk to sales",
    href: "/signup",
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h2 className="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple plans that pay for themselves
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Start free and upgrade when your catalog grows. One correctly priced product
            usually covers the cost.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-foreground/5",
                plan.highlighted &&
                  "border-primary/40 shadow-lg shadow-primary/10 ring-primary/20 lg:-translate-y-2"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                  Recommended
                </span>
              )}

              <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                {plan.cadence && (
                  <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                )}
              </div>

              <Button
                className="mt-6 w-full"
                variant={plan.highlighted ? "default" : "outline"}
                render={<Link href={plan.href} />}
              >
                {plan.cta}
              </Button>

              <ul className="mt-6 space-y-3 border-t pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
