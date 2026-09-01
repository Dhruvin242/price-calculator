import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Pages an authenticated user has no reason to see. `/reset-password` is
// intentionally excluded: reaching it requires an active recovery session.
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make it very hard to debug issues with users being
  // randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  const { pathname } = request.nextUrl

  // Guard the app: unauthenticated users cannot reach the dashboard.
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated users have no reason to see the landing page or auth pages —
  // send them straight to the app.
  const redirectsToApp =
    pathname === "/" ||
    AUTH_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`))
  if (user && redirectsToApp) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}
