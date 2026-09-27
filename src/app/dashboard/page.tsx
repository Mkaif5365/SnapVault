import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRightIcon, CalendarBlankIcon, FilmStripIcon, PlusIcon, SignOutIcon } from "@phosphor-icons/react/dist/ssr"
import { AppHeader } from "@/components/app/AppHeader"
import { StatusBadge } from "@/components/app/StatusBadge"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-[100dvh]">
      <AppHeader>
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="sm">
            <SignOutIcon />
            Sign out
          </Button>
        </form>
      </AppHeader>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-[-0.035em] text-ink-100 md:text-5xl">Your vaults</h1>
            <p className="mt-2 text-ink-400">
              {events && events.length > 0
                ? `${events.length} ${events.length === 1 ? "event" : "events"}. Open one to share the code or change the reveal time.`
                : "Create a vault for each event you host."}
            </p>
          </div>
          <Button asChild size="lg" className="self-start sm:self-auto">
            <Link href="/dashboard/events/new">
              <PlusIcon weight="bold" />
              New vault
            </Link>
          </Button>
        </div>

        {events && events.length > 0 ? (
          <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const revealDate = new Date(event.reveal_time);
              const isRevealed = revealDate < new Date();

              return (
                <li key={event.id}>
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="surface group flex h-full flex-col p-5 transition-[transform,border-color] duration-300 ease-out-expo hover:-translate-y-1 hover:border-white/[0.12]"
                  >
                    <div className="flex items-center justify-between">
                      <StatusBadge status={isRevealed ? "revealed" : "developing"} />
                      <span className="tabular font-mono text-xs text-ink-400">#{event.code}</span>
                    </div>
                    <h2 className="mt-5 line-clamp-2 font-display text-2xl font-semibold tracking-[-0.025em] text-ink-100">
                      {event.name}
                    </h2>
                    <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4 text-sm">
                      <div>
                        <dt className="flex items-center gap-1.5 text-ink-400">
                          <CalendarBlankIcon className="size-3.5" /> Reveal
                        </dt>
                        <dd className="mt-1 text-ink-200">
                          {revealDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })},{" "}
                          {revealDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1.5 text-ink-400">
                          <FilmStripIcon className="size-3.5" /> Roll size
                        </dt>
                        <dd className="tabular mt-1 text-ink-200">{event.photo_limit} shots</dd>
                      </div>
                    </dl>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-300 transition-colors group-hover:text-flare-400">
                      Open vault
                      <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="surface mt-10 grid grid-cols-1 items-center gap-10 overflow-hidden p-8 md:grid-cols-[1fr_1.1fr] md:p-12">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink-100">A fresh roll, ready to load.</h2>
              <p className="mt-3 max-w-[40ch] text-ink-400">
                Name your event, pick a reveal time, and share the code. Guests can start shooting right away.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/dashboard/events/new">
                  <PlusIcon weight="bold" />
                  Create your first vault
                </Link>
              </Button>
            </div>
            {/* Unexposed prints: what an empty vault looks like */}
            <div aria-hidden className="relative mx-auto h-56 w-full max-w-sm [perspective:1000px]">
              {[-14, 0, 12].map((r, i) => (
                <div
                  key={r}
                  className="print absolute top-1/2 left-1/2 w-40"
                  style={{ transform: `translate(-50%, -50%) translateX(${(i - 1) * 70}px) rotateY(-18deg) rotateZ(${r}deg) translateZ(${i * 20}px)` }}
                >
                  <div className="flex aspect-[4/5] items-end justify-end rounded-[2px] bg-gradient-to-br from-ink-800 to-ink-950 p-2">
                    <span className="stamp text-[11px] opacity-70">&apos;-- -- --</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-6 text-sm text-[#ff9ea1]">Could not load your vaults: {error.message}</p>
        )}
      </main>
    </div>
  )
}
