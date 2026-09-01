import Link from "next/link"
import { Plus } from "lucide-react"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/dashboard/user-menu"
import { Button } from "@/components/ui/button"

/**
 * Below `lg` navigation lives in the bottom tab bar (thumb-reachable), so the
 * header only carries identity + account controls there.
 */
export function DashboardHeader({ name, email }: { name: string; email: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-[calc(4rem+env(safe-area-inset-top))] items-center gap-3 border-b bg-background/80 px-4 pt-safe backdrop-blur-xl sm:px-6">
      <div className="lg:hidden">
        <Logo />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" className="hidden sm:inline-flex" render={<Link href="/dashboard/calculator" />}>
          <Plus className="size-4" /> New product
        </Button>
        <ThemeToggle />
        <UserMenu name={name} email={email} />
      </div>
    </header>
  )
}
