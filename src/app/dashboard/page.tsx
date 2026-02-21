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
    <div className="min-h-screen bg-stone-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
          <div>
            <h1 className="text-4xl font-serif text-stone-900 italic">Host Dashboard</h1>
            <p className="text-stone-500 mt-1">Manage your event vaults and reveal times.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/dashboard/events/new" className="flex-1 sm:flex-none">
              <Button className="w-full bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-full flex gap-2">
                <PlusCircle className="w-4 h-4" />
                New Event
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-200 rounded-full">
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
                <Card key={event.id} className="bg-white border-stone-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${isRevealed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isRevealed ? 'Revealed' : 'Developing'}
                      </span>
                      <span className="text-stone-400 font-mono text-xs">#{event.code}</span>
                    </div>
                    <CardTitle className="text-xl font-serif italic text-stone-900 truncate mt-2">
                      {event.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span>Reveal: {revealDate.toLocaleDateString()} at {revealDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-stone-400" />
                        <span>Target: {event.photo_limit} photos</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/events/${event.id}`}>
                      <Button variant="outline" className="w-full border-stone-200 text-stone-800 hover:bg-stone-50 mt-2">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-dashed border-2 border-stone-200 rounded-2xl p-12 text-center space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-stone-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-serif italic text-stone-900">No events yet</h3>
              <p className="text-stone-500 max-w-xs mx-auto text-sm">Create your first event to start capturing memories with your guests.</p>
            </div>
            <Link href="/dashboard/events/new">
              <Button className="bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-full px-8">
                Create First Event
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
