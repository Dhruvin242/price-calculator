"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
]

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full pt-safe px-safe transition-colors duration-200",
        scrolled
          ? "border-b border-border/70 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button size="sm" className="hidden sm:inline-flex" render={<Link href="/signup" />}>
            Start free
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72 pt-safe pb-safe">
              <div className="flex flex-col gap-1 p-6 pt-16">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className="rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors active:scale-[0.98] hover:bg-muted hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    }
                  />
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  <SheetClose render={<Button variant="outline" render={<Link href="/login" />} />}>
                    Log in
                  </SheetClose>
                  <SheetClose render={<Button render={<Link href="/signup" />} />}>
                    Start free
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
