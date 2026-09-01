"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"

/**
 * A numeric input that keeps a string buffer while focused so users can clear
 * the field and type decimals without the value snapping back to 0.
 */
export function NumberInput({
  value,
  onValueChange,
  className,
  min = 0,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "min"> & {
  value: number
  onValueChange: (value: number) => void
  min?: number
}) {
  const [text, setText] = React.useState(() => (value ? String(value) : ""))
  const focused = React.useRef(false)

  React.useEffect(() => {
    if (!focused.current) setText(value ? String(value) : "")
  }, [value])

  return (
    <Input
      inputMode="decimal"
      className={className}
      value={text}
      onFocus={() => {
        focused.current = true
      }}
      onBlur={() => {
        focused.current = false
        setText(value ? String(value) : "")
      }}
      onChange={(event) => {
        const raw = event.target.value
        if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return
        setText(raw)
        const parsed = parseFloat(raw)
        onValueChange(Number.isFinite(parsed) && parsed >= min ? parsed : 0)
      }}
      {...props}
    />
  )
}
