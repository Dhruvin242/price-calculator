import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card/50 px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl border bg-muted/50 text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 font-heading text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
