import { Logo } from "@/components/logo"
import { DashboardNav } from "@/components/dashboard/nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { MobileTabBar } from "@/components/dashboard/mobile-tabbar"
import { UserMenu } from "@/components/dashboard/user-menu"
import { requireUser, getProfile } from "@/lib/queries"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const profile = await getProfile()
  const name = profile?.full_name ?? (user.user_metadata?.full_name as string) ?? ""
  const email = user.email ?? ""

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <DashboardNav />
        </div>
        <div className="border-t p-3">
          <UserMenu name={name} email={email} align="start" variant="block" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <DashboardHeader name={name} email={email} />
        {/* bottom padding clears the mobile tab bar (4rem + safe area) */}
        <main className="flex-1 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(6rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileTabBar />
    </div>
  )
}
