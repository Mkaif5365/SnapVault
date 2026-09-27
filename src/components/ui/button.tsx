import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Radius rule: every button is a full pill. Pressed state sinks 1px.
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-out-expo active:translate-y-px active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-flare-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 aria-invalid:ring-safelight/40",
  {
    variants: {
      variant: {
        default:
          "bg-flare-500 text-ink-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_1px_2px_rgb(0_0_0/0.4),0_10px_24px_-10px_rgb(236_106_46/0.7)] hover:bg-flare-400",
        destructive:
          "bg-safelight/12 text-[#ff8589] border border-safelight/25 hover:bg-safelight/20",
        outline:
          "border border-white/10 bg-white/[0.02] text-ink-100 hover:bg-white/[0.06] hover:border-white/15",
        secondary:
          "bg-ink-800 text-ink-100 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] hover:bg-ink-700",
        ghost: "text-ink-300 hover:bg-white/[0.05] hover:text-ink-100",
        link: "text-ink-100 underline decoration-white/20 underline-offset-4 hover:decoration-flare-500",
        light:
          "bg-ink-100 text-ink-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_10px_24px_-12px_rgb(0_0_0/0.8)] hover:bg-white",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        xs: "h-7 gap-1 px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-[13px] has-[>svg]:px-3",
        lg: "h-12 px-7 text-[15px] has-[>svg]:px-6",
        xl: "h-14 px-8 text-base has-[>svg]:px-7",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
