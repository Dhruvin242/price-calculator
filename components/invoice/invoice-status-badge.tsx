import { Badge } from "@/components/ui/badge"
import { STATUS_META, type InvoiceStatus } from "@/lib/invoice"
import { cn } from "@/lib/utils"

const TONE_CLASS: Record<InvoiceStatus, string> = {
  draft: "",
  issued: "",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  overdue: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  cancelled: "",
}

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus
  className?: string
}) {
  const meta = STATUS_META[status]
  const variant =
    status === "issued"
      ? "default"
      : status === "cancelled"
        ? "destructive"
        : status === "draft"
          ? "secondary"
          : "ghost"

  return (
    <Badge variant={variant} className={cn(TONE_CLASS[status], className)}>
      {meta.label}
    </Badge>
  )
}
