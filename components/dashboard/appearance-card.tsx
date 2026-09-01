"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  // Theme is only known on the client; defer the active highlight until mount
  // to avoid a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), [])
  const active = mounted ? theme : undefined

  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          aria-pressed={active === option.value}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-colors",
            active === option.value
              ? "border-primary/40 bg-primary/5 text-foreground ring-1 ring-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <option.icon className="size-5" />
          {option.label}
        </button>
      ))}
    </div>
  )
}
