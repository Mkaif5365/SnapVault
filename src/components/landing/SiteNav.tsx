import Link from "next/link"
import { Logo } from "@/components/brand/Logo"
import { Button } from "@/components/ui/button"

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4">
      <nav
        aria-label="Main"
        className="glass mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full pr-2 pl-4"
      >
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          <Link href="#how" className="rounded-full px-3.5 py-2 text-sm text-ink-300 transition-colors hover:text-ink-100">
            How it works
          </Link>
          <Link href="#features" className="rounded-full px-3.5 py-2 text-sm text-ink-300 transition-colors hover:text-ink-100">
            Features
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/login" className="rounded-full px-3.5 py-2 text-sm text-ink-300 transition-colors hover:text-ink-100">
            Sign in
          </Link>
          <Button asChild size="sm" className="h-9 px-4">
            <Link href="/register">Create a vault</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
