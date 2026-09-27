import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * SnapVault mark: a single-use camera body seen head-on. The lens holds an
 * orange "latent image" dot, the same orange as the camera's date stamp.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("size-8", className)}>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#1e1e22" />
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="white" strokeOpacity="0.1" />
      <rect x="6" y="9.5" width="20" height="14" rx="3.5" stroke="#ededf0" strokeWidth="1.8" />
      <rect x="8.5" y="7" width="4.5" height="2.5" rx="1" fill="#ededf0" />
      <circle cx="16" cy="16.5" r="4.25" stroke="#ededf0" strokeWidth="1.8" />
      <circle cx="16" cy="16.5" r="1.9" fill="#ec6a2e" />
      <rect x="21" y="12" width="2.4" height="2.4" rx="0.6" fill="#ec6a2e" />
    </svg>
  )
}

export function Logo({
  href = "/",
  className,
  markClassName,
}: {
  href?: string | null
  className?: string
  markClassName?: string
}) {
  const content = (
    <>
      <LogoMark className={markClassName} />
      <span className="font-display text-[19px] font-semibold tracking-[-0.03em] text-ink-100">
        SnapVault
      </span>
    </>
  )

  if (href === null) {
    return <span className={cn("inline-flex items-center gap-2.5", className)}>{content}</span>
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full transition-opacity hover:opacity-80",
        className
      )}
    >
      {content}
    </Link>
  )
}
