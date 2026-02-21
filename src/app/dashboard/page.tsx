import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle, Calendar, Users, Camera } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans antialiased relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-900/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-stone-900 pb-8">
          <div>
            <h1 className="text-4xl font-serif text-stone-100 italic tracking-tight">Host Dashboard</h1>
            <p className="text-stone-500 mt-1 font-light">Manage your event vaults and reveal times.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/dashboard/events/new" className="flex-1 sm:flex-none">
              <Button className="w-full bg-amber-500 text-stone-950 hover:bg-amber-400 rounded-full flex gap-2 font-medium shadow-lg shadow-amber-500/10 transition-all active:scale-95">
                <PlusCircle className="w-4 h-4" />
                New Event
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline" className="border-stone-800 text-stone-400 hover:bg-stone-900 hover:text-stone-100 rounded-full transition-all active:scale-95">
                Sign Out
              </Button>
            </form>
          </div>
        </header>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const revealDate = new Date(event.reveal_time);
              const isRevealed = revealDate < new Date();
              
              return (
                <Card key={event.id} className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl hover:border-stone-700/50 transition-all hover:shadow-2xl group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full font-mono font-bold ${isRevealed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {isRevealed ? 'Revealed' : 'Developing'}
                      </span>
                      <span className="text-stone-600 font-mono text-[10px] uppercase tracking-widest">#{event.code}</span>
                    </div>
                    <CardTitle className="text-xl font-serif italic text-stone-100 truncate mt-4">
                      {event.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-3 text-stone-400">
                        <div className="w-7 h-7 rounded-lg bg-stone-950/50 border border-stone-800 flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">Reveal Date</p>
                          <p className="text-stone-300 font-medium">{revealDate.toLocaleDateString()} @ {revealDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-stone-400">
                        <div className="w-7 h-7 rounded-lg bg-stone-950/50 border border-stone-800 flex items-center justify-center">
                          <Camera className="w-3.5 h-3.5 text-stone-500" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">Film Roll</p>
                          <p className="text-stone-300 font-medium">{event.photo_limit} Maximum Photos</p>
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/events/${event.id}`}>
                      <Button variant="outline" className="w-full border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-stone-100 rounded-xl transition-all">
                        Open Vault
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-stone-900/20 border-dashed border-2 border-stone-800/50 rounded-3xl p-16 text-center space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-stone-900 rounded-2xl flex items-center justify-center shadow-inner border border-stone-800">
              <Camera className="w-8 h-8 text-stone-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif italic text-stone-100 tracking-tight">No Active Vaults</h3>
              <p className="text-stone-500 max-w-sm mx-auto text-sm font-light">Your events will appear here once you create your first film roll vault.</p>
            </div>
            <Link href="/dashboard/events/new">
              <Button className="bg-amber-500 text-stone-950 hover:bg-amber-400 rounded-full px-10 font-medium shadow-lg shadow-amber-500/10">
                Create First Event
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
