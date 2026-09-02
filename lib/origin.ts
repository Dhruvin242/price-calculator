import { type NextRequest } from "next/server"

/**
 * Resolves the public origin to redirect back to after an auth callback.
 *
 * `request.url` reports the internal host behind a proxy (Vercel, a load
 * balancer), so prefer the configured site URL, then the forwarded host, and
 * only fall back to the request's own origin for local development.
 */
export function getPublicOrigin(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) return siteUrl.replace(/\/$/, "")

  const forwardedHost = request.headers.get("x-forwarded-host")
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https"
    return `${proto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}
