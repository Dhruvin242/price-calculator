"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { INVOICE_STATUSES, STATUS_META, type InvoiceStatus } from "@/lib/invoice"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL = "all"

export function InvoicesFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [search, setSearch] = React.useState(params.get("q") ?? "")
  const status = (params.get("status") as InvoiceStatus | null) ?? null

  const statusItems = React.useMemo(() => {
    const items: Record<string, string> = { [ALL]: "All statuses" }
    for (const s of INVOICE_STATUSES) items[s] = STATUS_META[s].label
    return items
  }, [])

  function commit(next: URLSearchParams) {
    next.delete("page")
    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  function onSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (search.trim()) next.set("q", search.trim())
    else next.delete("q")
    commit(next)
  }

  function onStatusChange(value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (!value || value === ALL) next.delete("status")
    else next.set("status", value)
    commit(next)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form onSubmit={onSearchSubmit} className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by invoice number or customer…"
          className="pl-9"
          aria-label="Search invoices"
        />
      </form>
      <Select value={status ?? ALL} onValueChange={onStatusChange} items={statusItems}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {INVOICE_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_META[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
