import Link from "next/link"
import { Flower2 } from "lucide-react"

import { cn } from "@/lib/utils"

export function Logo({
  href = "/",
  className,
  showWordmark = true,
}: {
  href?: string | null
  className?: string
  showWordmark?: boolean
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Flower2 className="size-4.5" />
      </span>
      {showWordmark && (
        <span className="font-heading text-[15px] font-semibold tracking-tight">
          Bloom Factory
        </span>
      )}
    </span>
  )

  if (!href) return content

  return (
    <Link href={href} className="inline-flex items-center rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30">
      {content}
    </Link>
  )
}
