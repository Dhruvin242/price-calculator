import type { Metadata, Viewport } from "next"
import { Public_Sans, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bloomfactory.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bloom Factory — Pricing for handmade makers",
    template: "%s · Bloom Factory",
  },
  description:
    "Price every handmade product with confidence. Bloom Factory turns your materials, labor, and overhead into wholesale and retail prices — and tells you when your margins are healthy.",
  keywords: [
    "pricing calculator",
    "handmade pricing",
    "craft business",
    "wholesale pricing",
    "profit margin",
    "small business tools",
  ],
  authors: [{ name: "Bloom Factory" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Bloom Factory — Pricing for handmade makers",
    description:
      "Turn materials, labor, and overhead into prices that protect your margin. Built for handmade and craft businesses.",
    siteName: "Bloom Factory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bloom Factory — Pricing for handmade makers",
    description:
      "Turn materials, labor, and overhead into prices that protect your margin.",
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // never trap a pinch-zoom — accessibility, not a "clean" app shell
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1214" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", publicSans.variable)}
    >
      <body className="min-h-svh bg-background text-foreground">
        <ThemeProvider>
          {children}
          <Toaster position="top-center" offset={12} mobileOffset={12} />
        </ThemeProvider>
      </body>
    </html>
  )
}
