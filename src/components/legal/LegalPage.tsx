import Link from "next/link"
import { Logo } from "@/components/brand/Logo"

export const LEGAL_CONTACT_EMAIL = "kkaif2004@gmail.com"
export const LEGAL_EFFECTIVE_DATE = "September 27, 2026"

/** Shared layout for the privacy policy and terms pages. */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh]">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Logo />
          <nav aria-label="Legal" className="flex gap-5 text-sm text-ink-400">
            <Link href="/privacy" className="hover:text-ink-100">Privacy</Link>
            <Link href="/terms" className="hover:text-ink-100">Terms</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink-100 md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-ink-400">Effective {LEGAL_EFFECTIVE_DATE}</p>
        <p className="mt-8 text-lg leading-relaxed text-ink-300">{intro}</p>
        <div className="legal mt-12 space-y-12">{children}</div>
        <p className="mt-16 border-t border-white/[0.06] pt-8 text-sm text-ink-400">
          Questions? Email{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-ink-100 underline decoration-white/20 underline-offset-4 hover:decoration-flare-500">
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </main>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold tracking-[-0.025em] text-ink-100">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-ink-300 [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-ink-100 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  )
}
