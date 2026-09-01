import type { Metadata } from "next"
import { LogOut } from "lucide-react"

import { signOut } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppearanceCard } from "@/components/dashboard/appearance-card"
import { PasswordForm } from "@/components/dashboard/password-form"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your appearance, password, and session.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Bloom Factory looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceCard />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Password</CardTitle>
          <CardDescription>Update the password you use to log in.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out of your account on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              <LogOut className="size-4" /> Log out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
