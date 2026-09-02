import { NextResponse, type NextRequest } from "next/server"

import { getPublicOrigin } from "@/lib/origin"
import { createClient } from "@/lib/server"

/**
 * Handles the PKCE redirect for email confirmation and password-reset links.
 * Exchanges the `code` for a session cookie, then forwards the user on.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = getPublicOrigin(request)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
