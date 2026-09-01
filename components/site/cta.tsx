import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Cta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-4xl border bg-card px-6 py-16 text-center shadow-lg ring-1 ring-foreground/5 sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-primary)/10%,transparent_70%)]"
          />
          <h2 className="mx-auto max-w-2xl text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop guessing. Start pricing for profit.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Join thousands of makers who price with confidence. It’s free to start and
            takes minutes to see your first honest number.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/signup" />}>
              Create your free account
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
