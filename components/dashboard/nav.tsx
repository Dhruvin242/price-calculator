"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calculator,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/calculator", label: "Calculator", icon: Calculator },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/stalls", label: "Live Stall", icon: Store },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors pointer-coarse:py-3 active:scale-[0.98]",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "size-4 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
