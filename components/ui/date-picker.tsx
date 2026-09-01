"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function toDate(value?: string | null): Date | undefined {
  if (!value) return undefined
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** Local YYYY-MM-DD (avoids the UTC shift that toISOString would cause). */
function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Pick a date",
  disabled,
}: {
  value: string | null
  onChange: (value: string | null) => void
  id?: string
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const selected = toDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            {selected
              ? selected.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : placeholder}
            <CalendarIcon className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          captionLayout="dropdown"
          autoFocus
          onSelect={(date) => {
            onChange(date ? toISODate(date) : null)
            setOpen(false)
          }}
        />
        {selected && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
