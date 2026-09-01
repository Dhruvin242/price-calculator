import Link from "next/link"
import { AtSign, Globe, Mail } from "lucide-react"

import { Logo } from "@/components/logo"

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Calculator", href: "/dashboard/calculator" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Testimonials", href: "/#testimonials" },
      { label: "Contact", href: "mailto:hello@bloomfactory.app" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Pricing guide", href: "/#how-it-works" },
      { label: "Support", href: "mailto:support@bloomfactory.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
      { label: "Security", href: "/#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Pricing built for handmade makers. Know your true cost, protect your margin,
              and price with confidence.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: AtSign, label: "Social" },
                { icon: Globe, label: "Website" },
                { icon: Mail, label: "Email" },
              ].map(({ icon: Icon, label }) => (
                <Link
                  key={label}
                  href="/#"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-xl border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Bloom Factory. All rights reserved.</p>
          <p>Made for makers who mean business.</p>
        </div>
      </div>
    </footer>
  )
}
