import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-white/10 bg-ink-950/70 px-3.5 py-1 text-[15px] text-ink-100 shadow-[inset_0_1px_2px_rgb(0_0_0/0.4)] transition-[border-color,box-shadow,background-color] duration-200 outline-none placeholder:text-ink-500 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-100 hover:border-white/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:dark]",
        "focus-visible:border-flare-500/70 focus-visible:bg-ink-950 focus-visible:ring-4 focus-visible:ring-flare-500/15 focus-visible:outline-none",
        "aria-invalid:border-safelight/60 aria-invalid:ring-4 aria-invalid:ring-safelight/10",
        className
      )}
      {...props}
    />
  )
}

export { Input }
