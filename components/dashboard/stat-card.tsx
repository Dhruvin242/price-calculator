import type { LucideIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  className?: string
}) {
  return (
    <Card className={cn("gap-0 p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
        <span className="hidden size-8 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground sm:flex">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 font-heading text-xl font-semibold tracking-tight tabular-nums sm:mt-3 sm:text-2xl">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}
