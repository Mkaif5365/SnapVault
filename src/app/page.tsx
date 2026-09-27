import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ArrowRightIcon,
  DownloadSimpleIcon,
  LockIcon,
  QrCodeIcon,
  TimerIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { SiteNav } from "@/components/landing/SiteNav";
import { HeroStage } from "@/components/landing/HeroStage";
import { FilterDeck } from "@/components/landing/FilterDeck";
import { JoinQR, VaultTimer } from "@/components/landing/BentoWidgets";
import { FilmStrip } from "@/components/landing/FilmStrip";
import { DevelopReel } from "@/components/landing/DevelopReel";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink-100 focus:px-4 focus:py-2 focus:text-ink-950">
        Skip to content
      </a>
      <SiteNav />

      <main id="main">
        {/* Hero: asymmetric split, copy left, 3D print stack right */}
        <section className="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-10 px-5 pt-28 pb-16 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pt-24">
          <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 h-[520px] w-[900px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(236_106_46/0.10),transparent)]" />
          <div className="relative max-w-2xl">
            <h1 className="font-display text-[clamp(2.75rem,5.4vw,4.75rem)] leading-[0.98] font-bold tracking-[-0.045em] text-ink-100">
              Everyone shoots.
              <span className="block text-ink-400">Nobody peeks.</span>
            </h1>
            <p className="mt-7 max-w-[34ch] text-lg leading-relaxed text-ink-300 md:text-xl">
              SnapVault is a disposable camera that runs in your guests&apos; browsers. Every shot stays locked until your reveal time.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="group">
                <Link href="/register">
                  Create a vault
                  <ArrowRightIcon weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="#how">How it works</Link>
              </Button>
            </div>
          </div>
          <HeroStage />
        </section>

        {/* How it works: a strip of film in perspective */}
        <section id="how" className="relative scroll-mt-24 border-t border-white/[0.05] bg-ink-900/40 py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink-100 md:text-5xl">
                Three moves. No app to install.
              </h2>
              <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-400">
                You set the reveal time. Your guests do the rest from the phone already in their pocket.
              </p>
            </div>
            <div className="mt-16 md:mt-20">
              <FilmStrip />
            </div>
          </div>
        </section>

        {/* Features: bento with real component previews */}
        <section id="features" className="scroll-mt-24 py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <h2 className="max-w-3xl font-display text-4xl font-bold tracking-[-0.035em] text-ink-100 md:text-5xl">
              Built like a real roll of film, run like an event app.
            </h2>

            <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-6 md:gap-4">
              <article className="surface p-6 md:col-span-4 md:row-span-2 md:p-8">
                <h3 className="font-display text-2xl font-semibold tracking-[-0.025em] text-ink-100">Film looks, applied in camera</h3>
                <p className="mt-2 max-w-[48ch] text-ink-400">
                  Grainy B&amp;W, Vintage Sepia, Polaroid Soft and the &apos;98 date stamp, previewed live in the viewfinder.
                </p>
                <div className="mt-6">
                  <FilterDeck />
                </div>
              </article>

              <article className="surface relative overflow-hidden p-6 md:col-span-2">
                <div aria-hidden className="animate-safelight absolute -top-16 -right-10 size-48 rounded-full bg-safelight/20 blur-3xl" />
                <TimerIcon className="relative size-6 text-flare-500" />
                <h3 className="relative mt-4 font-display text-xl font-semibold tracking-[-0.02em] text-ink-100">A vault with a timer</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-ink-400">Photos stay hidden until the reveal time you set.</p>
                <div className="relative mt-5">
                  <VaultTimer />
                </div>
              </article>

              <article className="surface flex items-center gap-5 p-6 md:col-span-2">
                <JoinQR />
                <div>
                  <QrCodeIcon className="size-6 text-flare-500" />
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-ink-100">No app. No account.</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-400">Guests scan, type a name, and start shooting.</p>
                </div>
              </article>

              <article className="relative min-h-[280px] overflow-hidden rounded-[20px] border border-white/[0.07] md:col-span-3">
                <Image src="/shots/stage-lights.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/20" />
                <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
                  <div className="flex gap-2 text-ink-100">
                    <LockIcon className="size-6" />
                    <UsersThreeIcon className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.025em] text-ink-100">You run the room</h3>
                  <p className="mt-2 max-w-[44ch] text-ink-300">
                    Lock entry, remove guests, move the reveal time and top up the roll from one dashboard.
                  </p>
                </div>
              </article>

              <article className="surface flex flex-col justify-between gap-8 overflow-hidden p-6 md:col-span-3 md:p-8">
                <div className="flex -space-x-6 [perspective:800px]">
                  {["sparkler", "heart-hands", "photographer", "night-kiss", "wedding-van"].map((n, i) => (
                    <div
                      key={n}
                      className="print w-[21%] shrink-0 !p-[4%] [transform:rotateY(-24deg)]"
                      style={{ zIndex: 5 - i }}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px]">
                        <Image src={`/shots/${n}.jpg`} alt="" fill sizes="120px" className="object-cover" />
                      </div>
                      <p className="mt-1.5 font-mono text-[9px] text-ink-700">IMG_{String(i + 1).padStart(4, "0")}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <DownloadSimpleIcon className="size-6 text-flare-500" />
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.025em] text-ink-100">The whole roll, one ZIP</h3>
                  <p className="mt-2 max-w-[44ch] text-ink-400">Every photo and video, numbered in order like a lab scan.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* The reveal: scroll-linked developing tray */}
        <section className="border-t border-white/[0.05] py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink-100 md:text-6xl">
                Then the whole roll develops at once.
              </h2>
              <p className="mx-auto mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-400">
                When the timer hits zero, every guest sees every shot at the same moment.
              </p>
            </div>
            <div className="mt-14 md:mt-20">
              <DevelopReel />
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative overflow-hidden py-28 md:py-40">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px] bg-[radial-gradient(closest-side,rgb(236_106_46/0.16),transparent)]" />
          <div className="relative mx-auto max-w-3xl px-5 text-center">
            <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[1] font-bold tracking-[-0.045em] text-ink-100">
              Start a vault for your next event.
            </h2>
            <p className="mt-6 text-lg text-ink-400">Free to use. No downloads. Works on any phone.</p>
            <Button asChild size="xl" className="group mt-10">
              <Link href="/register">
                Create a vault
                <ArrowRightIcon weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.05]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center md:px-8">
          <Logo />
          <nav aria-label="Footer" className="flex gap-6 text-sm text-ink-400">
            <Link href="#how" className="hover:text-ink-100">How it works</Link>
            <Link href="/login" className="hover:text-ink-100">Sign in</Link>
            <Link href="/register" className="hover:text-ink-100">Create a vault</Link>
          </nav>
          <p className="text-sm text-ink-400">&copy; {new Date().getFullYear()} SnapVault</p>
        </div>
      </footer>
    </div>
  );
}
