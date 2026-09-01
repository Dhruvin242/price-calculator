import { HEALTH_META, type HealthStatus } from "@/lib/pricing"
import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<string, string> = {
  success:
    "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
}

export function HealthBadge({
  health,
  className,
}: {
  health: HealthStatus
  className?: string
}) {
  const meta = HEALTH_META[health]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        TONE_CLASSES[meta.tone],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  )
}
