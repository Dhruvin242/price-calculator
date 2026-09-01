"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { updateInvoiceStatus } from "@/lib/actions"
import { nextStatuses, STATUS_META, type InvoiceStatus } from "@/lib/invoice"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function InvoiceStatusControl({
  id,
  status,
}: {
  id: string
  status: InvoiceStatus
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const options = nextStatuses(status)

  if (options.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Check className="size-4" /> {STATUS_META[status].label}
      </Button>
    )
  }

  function change(next: InvoiceStatus) {
    startTransition(async () => {
      const res = await updateInvoiceStatus(id, next)
      if (res.ok) {
        toast.success(`Marked ${STATUS_META[next].label.toLowerCase()}`)
        router.refresh()
      } else {
        toast.error(res.error ?? "Could not update status")
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            Change status
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem key={option} onClick={() => change(option)}>
            Mark {STATUS_META[option].label.toLowerCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
