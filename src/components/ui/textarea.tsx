import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-xl border border-white/10 bg-ink-950/70 px-3.5 py-3 text-[15px] text-ink-100 shadow-[inset_0_1px_2px_rgb(0_0_0/0.4)] transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-ink-500 hover:border-white/15 focus-visible:border-flare-500/70 focus-visible:ring-4 focus-visible:ring-flare-500/15 focus-visible:outline-none aria-invalid:border-safelight/60 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
