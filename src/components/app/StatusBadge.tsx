import { cn } from "@/lib/utils"

type Status = "developing" | "revealed" | "locked"

const STYLES: Record<Status, { label: string; className: string; dot: string }> = {
  developing: { label: "Developing", className: "bg-flare-500/10 text-flare-300 ring-flare-500/25", dot: "bg-flare-500" },
  revealed: { label: "Revealed", className: "bg-developed/10 text-[#7ee0ae] ring-developed/25", dot: "bg-developed" },
  locked: { label: "Entry closed", className: "bg-safelight/10 text-[#ff9ea1] ring-safelight/25", dot: "bg-safelight" },
}

/** Vault state. The dot carries real state (not decoration). */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const s = STYLES[status]
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1 ring-inset",
        s.className,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  )
}
