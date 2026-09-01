import Link from "next/link"
import { ArrowLeft, Flower2, Gauge, ShieldCheck, Tags } from "lucide-react"

import { Logo } from "@/components/logo"

const HIGHLIGHTS = [
  { icon: Tags, text: "Wholesale & retail pricing in one view" },
  { icon: Gauge, text: "Margin-health ratings on every product" },
  { icon: ShieldCheck, text: "Platform fees absorbed automatically" },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* form side */}
      <div className="flex flex-col px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* brand side */}
      <div className="relative hidden overflow-hidden border-l bg-muted/40 lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_20%,var(--color-primary)/10%,transparent_70%)]"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Flower2 className="size-6" />
          </div>

          <div className="max-w-md">
            <blockquote className="font-heading text-2xl font-medium leading-snug tracking-tight">
              “I was underpricing my bouquets by almost 40%. Bloom Factory showed me the real
              number in ten minutes.”
            </blockquote>
            <p className="mt-4 text-sm text-muted-foreground">
              Priya Nair · Founder, Marigold Market
            </p>
          </div>

          <ul className="space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex size-8 items-center justify-center rounded-xl border bg-background text-primary">
                  <item.icon className="size-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
