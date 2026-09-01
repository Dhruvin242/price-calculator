import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bloomfactory.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ]
}
