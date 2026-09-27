import { Logo } from "@/components/brand/Logo"

/** Top bar for host pages. Children render on the right. */
export function AppHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <Logo href="/dashboard" />
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  )
}
