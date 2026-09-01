import { Star } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Testimonial {
  quote: string
  name: string
  role: string
  initials: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I was underpricing my bouquets by almost 40%. Bloom Factory showed me the real number in about ten minutes. My margins have never been healthier.",
    name: "Priya Nair",
    role: "Founder, Marigold Market",
    initials: "PN",
  },
  {
    quote:
      "The margin-health rating is genius. Green means I sell it, red means I fix it. It took the anxiety out of pricing completely.",
    name: "Daniel Osei",
    role: "Owner, Lumen Candles",
    initials: "DO",
  },
  {
    quote:
      "Wholesale and retail side by side is exactly what I needed to start selling to boutiques without losing my shirt.",
    name: "Mara Whitfield",
    role: "Ceramicist, The Clay Studio",
    initials: "MW",
  },
  {
    quote:
      "It captures the platform fees I always forgot about. My Etsy payouts finally match what I planned for.",
    name: "Sofia Ramos",
    role: "Maker, Fern & Fox",
    initials: "SR",
  },
  {
    quote:
      "I replaced a spreadsheet I'd been babying for three years. This is the same math, but I can't break it anymore.",
    name: "Aisha Khan",
    role: "Florist, Wildbloom",
    initials: "AK",
  },
  {
    quote:
      "Saving each product means re-pricing after a supplier price hike is a two-minute job, not a two-hour one.",
    name: "Tom Becker",
    role: "Founder, Petal & Co.",
    initials: "TB",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-20 border-t bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Loved by makers</p>
          <h2 className="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Pricing that finally makes sense
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Thousands of small-batch businesses use Bloom Factory to protect their profit.
          </p>
          <p className="mt-2 text-xs text-muted-foreground sm:hidden" aria-hidden>
            Swipe to read more →
          </p>
        </div>

        {/* a swipeable rail on phones, a grid from sm up */}
        <div className="no-scrollbar overscroll-lock -mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="flex w-[82vw] shrink-0 snap-center flex-col justify-between rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-foreground/5 sm:w-auto sm:shrink"
            >
              <div>
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
                  “{item.quote}”
                </blockquote>
              </div>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {item.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
