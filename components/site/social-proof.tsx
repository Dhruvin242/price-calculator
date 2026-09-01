const BRANDS = [
  "Petal & Co.",
  "Wildbloom",
  "The Clay Studio",
  "Lumen Candles",
  "Marigold Market",
  "Fern & Fox",
]

export function SocialProof() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-center text-sm text-muted-foreground">
          Trusted by <span className="font-medium text-foreground">2,400+</span> makers pricing
          smarter every day
        </p>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 md:grid-cols-6">
          {BRANDS.map((brand) => (
            <div
              key={brand}
              className="flex items-center justify-center text-center text-sm font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
