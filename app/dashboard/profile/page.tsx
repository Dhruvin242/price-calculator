import type { Metadata } from "next"

import { getProfile, requireUser } from "@/lib/queries"
import { Card } from "@/components/ui/card"
import { ProfileForm } from "@/components/dashboard/profile-form"

export const metadata: Metadata = { title: "Profile" }

export default async function ProfilePage() {
  const [user, profile] = await Promise.all([requireUser(), getProfile()])

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details and default currency.
        </p>
      </div>

      <Card className="gap-0 p-6">
        <ProfileForm profile={profile} email={user.email ?? ""} />
      </Card>
    </div>
  )
}
