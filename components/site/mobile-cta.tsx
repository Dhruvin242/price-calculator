"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * A thumb-reachable signup bar that slides in once the hero's own CTA has
 * scrolled away, and retreats again near the footer so it never covers the
 * final call to action.
 */
export function MobileCta() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => {
      const { scrollY, innerHeight } = window
      const nearBottom =
        scrollY + innerHeight >= document.documentElement.scrollHeight - innerHeight * 0.6
      setVisible(scrollY > innerHeight * 0.9 && !nearBottom)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 px-4 py-3 backdrop-blur-xl pb-safe transition-transform duration-300 md:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Know your real price</p>
          <p className="truncate text-xs text-muted-foreground">
            Free forever · no card required
          </p>
        </div>
        <Button
          size="lg"
          tabIndex={visible ? undefined : -1}
          render={<Link href="/signup" />}
        >
          Start free
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
