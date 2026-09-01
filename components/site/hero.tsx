import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PricePreview } from "@/components/site/price-preview"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* subtle background treatment */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-primary)/8%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-8 sm:px-6 sm:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Link
            href="/#how-it-works"
            className="group inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            <Sparkles className="size-3.5 text-primary" />
            From spreadsheet to real pricing power
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1 className="mt-6 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
            Price your handmade work like a business
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Bloom Factory turns materials, labor, and overhead into wholesale and retail
            prices — and tells you the moment your margins stop making sense.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" render={<Link href="/signup" />}>
              Start pricing free
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              render={<Link href="/#how-it-works" />}
            >
              See how it works
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required · Free forever plan
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-4xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0 -z-10 bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-primary)/6%,transparent_70%)]"
          />
          <PricePreview />
        </div>
      </div>
    </section>
  )
}
