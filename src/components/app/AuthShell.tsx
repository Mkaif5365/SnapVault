import Image from "next/image"
import Link from "next/link"
import { Logo } from "@/components/brand/Logo"

const WALL = [
  { src: "/shots/wedding-van.jpg", stamp: "'26 06 14", className: "left-[10%] top-[12%] w-[42%] [transform:translateZ(40px)_rotate(-6deg)]" },
  { src: "/shots/sparkler.jpg", stamp: "'26 06 14", className: "left-[48%] top-[6%] w-[36%] [transform:translateZ(-30px)_rotate(7deg)]" },
  { src: "/shots/heart-hands.jpg", stamp: "'26 06 13", className: "left-[44%] top-[48%] w-[40%] [transform:translateZ(80px)_rotate(4deg)]" },
  { src: "/shots/night-kiss.jpg", stamp: "'26 06 13", className: "left-[6%] top-[54%] w-[34%] [transform:translateZ(10px)_rotate(-3deg)]" },
]

/** Split auth layout: form on the left, a wall of prints in perspective on the right. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <Logo />
        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink-100">{title}</h1>
          <p className="mt-3 text-ink-400">{subtitle}</p>
          <div className="mt-9">{children}</div>
          <div className="mt-8 text-sm text-ink-400">{footer}</div>
          <p className="mt-10 text-xs text-ink-400">
            By continuing you agree to the{" "}
            <Link href="/terms" className="underline decoration-white/20 underline-offset-4 hover:text-ink-100">Terms</Link> and{" "}
            <Link href="/privacy" className="underline decoration-white/20 underline-offset-4 hover:text-ink-100">Privacy Policy</Link>.
          </p>
        </main>
      </div>

      <aside aria-hidden className="relative hidden overflow-hidden border-l border-white/[0.05] bg-ink-900 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_60%_45%,rgb(236_106_46/0.16),transparent)]" />
        <div className="absolute inset-0 [perspective:1600px]">
          <div className="absolute inset-[6%] [transform-style:preserve-3d] [transform:rotateX(16deg)_rotateY(-14deg)]">
            {WALL.map((p) => (
              <figure key={p.src} className={`print absolute ${p.className}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-ink-900">
                  <Image src={p.src} alt="" fill sizes="30vw" className="object-cover" />
                  <span className="stamp absolute right-[6%] bottom-[5%] text-[12px]">{p.stamp}</span>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

export function GoogleMark() {
  // Official multi-colour Google "G" mark (brand asset, not a drawn icon).
  return (
    <svg className="size-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.69-2.3 1.1-3.71 1.1-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.04c-.22-.69-.35-1.43-.35-2.04s.13-1.35.35-2.04V7.12H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.88l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.12l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export function OrDivider() {
  return (
    <div className="my-7 flex items-center gap-4 text-xs text-ink-500">
      <span className="h-px flex-1 bg-white/[0.08]" />
      <span className="text-ink-400">or</span>
      <span className="h-px flex-1 bg-white/[0.08]" />
    </div>
  )
}
