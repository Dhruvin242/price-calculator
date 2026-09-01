const STEPS = [
  {
    step: "01",
    title: "Add your materials",
    description:
      "List what goes into one piece — pack cost, pack size, and how much you use. We work out the real per-unit cost.",
  },
  {
    step: "02",
    title: "Set labor & overhead",
    description:
      "Add your hourly rate, production time, packaging, and utilities. Nothing that costs you money gets left out.",
  },
  {
    step: "03",
    title: "Choose your margins",
    description:
      "Dial in wholesale and retail targets. Bloom Factory grosses up for platform fees so the price is the one you actually keep.",
  },
  {
    step: "04",
    title: "Price and save",
    description:
      "Get a recommended price with a margin-health rating, then save the product to your library and re-price anytime.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            From materials to a price in four steps
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            The whole flow takes a couple of minutes — and every product you save gets
            faster after that.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, index) => (
            <div key={item.step} className="relative">
              <div className="flex h-full flex-col rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-foreground/5">
                <span className="font-heading text-2xl font-semibold text-primary/30">
                  {item.step}
                </span>
                <h3 className="mt-3 font-heading text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="absolute top-1/2 -right-2 hidden h-px w-4 bg-border lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
