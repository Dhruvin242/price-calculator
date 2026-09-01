"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Mode = "login" | "signup"

interface FieldErrors {
  email?: string
  password?: string
  fullName?: string
}

function validate(mode: Mode, values: { email: string; password: string; fullName: string }) {
  const errors: FieldErrors = {}
  if (!values.email) errors.email = "Email is required."
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Enter a valid email address."

  if (!values.password) errors.password = "Password is required."
  else if (values.password.length < 8)
    errors.password = "Password must be at least 8 characters."

  if (mode === "signup" && !values.fullName.trim())
    errors.fullName = "Please tell us your name."

  return errors
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/dashboard"

  const [values, setValues] = React.useState({ email: "", password: "", fullName: "" })
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [emailSent, setEmailSent] = React.useState(false)

  const isSignup = mode === "signup"

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)

    const nextErrors = validate(mode, values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    const supabase = createClient()

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            data: { full_name: values.fullName.trim() },
          },
        })
        if (error) throw error

        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          toast.success("Welcome to Bloom Factory!")
          router.push(next)
          router.refresh()
        } else {
          setEmailSent(true)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })
        if (error) throw error
        toast.success("Welcome back!")
        router.push(next)
        router.refresh()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong."
      setFormError(message)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Alert>
        <AlertTitle>Check your inbox</AlertTitle>
        <AlertDescription>
          We sent a confirmation link to <strong>{values.email}</strong>. Click it to
          activate your account, then log in.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {isSignup && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Priya Nair"
            value={values.fullName}
            aria-invalid={!!errors.fullName}
            onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
          value={values.email}
          aria-invalid={!!errors.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {!isSignup && (
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "At least 8 characters" : "••••••••"}
            value={values.password}
            aria-invalid={!!errors.password}
            className="pr-10"
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <Button type="submit" className="mt-1 w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        {isSignup ? "Create account" : "Log in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account? " : "New to Bloom Factory? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {isSignup ? "Log in" : "Create one"}
        </Link>
      </p>
    </form>
  )
}
