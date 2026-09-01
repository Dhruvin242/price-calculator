"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, LayoutDashboard, MoreHorizontal, Package, Store, type LucideIcon } from "lucide-react"

import { Logo } from "@/components/logo"
import { DashboardNav } from "@/components/dashboard/nav"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface TabItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

/** The four thumb-reachable destinations. Everything else lives behind "More". */
const TABS: TabItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/stalls", label: "Stall", icon: Store },
]

function isActive(pathname: string, tab: TabItem) {
  return tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
}

function Tab({ tab, active }: { tab: TabItem; active: boolean }) {
  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground active:text-foreground"
      )}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-2xl transition-all duration-200",
          active ? "bg-primary/10" : "bg-transparent",
          "group-active:scale-90"
        )}
      >
        <tab.icon className="size-5" />
      </span>
      {tab.label}
    </Link>
  )
}

export function MobileTabBar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = React.useState(false)

  const calculatorActive = pathname.startsWith("/dashboard/calculator")

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 px-safe pb-safe backdrop-blur-xl lg:hidden"
    >
      <div className="grid h-16 grid-cols-5 items-stretch px-1">
        {TABS.slice(0, 2).map((tab) => (
          <Tab key={tab.href} tab={tab} active={isActive(pathname, tab)} />
        ))}

        {/* centre action — the thing makers open most */}
        <div className="relative flex items-start justify-center">
          <Link
            href="/dashboard/calculator"
            aria-label="Open the calculator"
            aria-current={calculatorActive ? "page" : undefined}
            className={cn(
              "-mt-5 flex size-14 items-center justify-center rounded-full text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-background transition-transform duration-150 active:scale-90",
              calculatorActive ? "bg-primary" : "bg-primary/90"
            )}
          >
            <Calculator className="size-6" />
          </Link>
        </div>

        {TABS.slice(2).map((tab) => (
          <Tab key={tab.href} tab={tab} active={isActive(pathname, tab)} />
        ))}

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                aria-label="More"
                className="group flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors active:text-foreground"
              >
                <span className="flex size-8 items-center justify-center rounded-2xl transition-transform duration-200 group-active:scale-90">
                  <MoreHorizontal className="size-5" />
                </span>
                More
              </button>
            }
          />
          <SheetContent side="bottom" showCloseButton={false} className="max-h-[80svh] rounded-t-3xl pb-safe">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-border" aria-hidden />
            <div className="flex items-center gap-2 px-6 pt-4">
              <Logo />
            </div>
            <div className="overscroll-lock min-h-0 flex-1 overflow-y-auto p-3 pb-6">
              <DashboardNav onNavigate={() => setMoreOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
