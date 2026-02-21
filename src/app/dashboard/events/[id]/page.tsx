"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, ExternalLink, Calendar, Camera, Users, CheckCircle2, Trash2, Eye, Download, Lock, Unlock, Clock, Trophy, UserX, UserMinus, Tag } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import GalleryGrid from "@/components/event/GalleryGrid"
import { removeParticipant, kickParticipant, updateRevealTime, toggleEventLock, applyPromocode } from "@/lib/actions/host"

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [participantsCount, setParticipantsCount] = useState(0)
  const [photosCount, setPhotosCount] = useState(0)
  const [participants, setParticipants] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [topPhotographer, setTopPhotographer] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [promoStatus, setPromoStatus] = useState<string | null>(null)
  const [newRevealTime, setNewRevealTime] = useState("")
  const supabase = createClient()

  useEffect(() => {
    async function fetchEventData() {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (eventError || !eventData) {
        console.error(eventError)
        router.push('/dashboard')
        return
      }

      setEvent(eventData)
      setNewRevealTime(new Date(eventData.reveal_time).toISOString().slice(0, 16))

      // Fetch participants
      const { data: participantData, count } = await supabase
        .from('participants')
        .select('*', { count: 'exact' })
        .eq('event_id', id)
        .order('created_at', { ascending: true })

      setParticipants(participantData || [])
      setParticipantsCount((participantData || []).filter(p => p.status === 'active').length)

      // Fetch photo count
      const { count: photoCount } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)

      setPhotosCount(photoCount || 0)

      // Find top photographer
      if (participantData && participantData.length > 0) {
        const { data: photoStats } = await supabase
          .from('photos')
          .select('participant_id')
          .eq('event_id', id)

        if (photoStats && photoStats.length > 0) {
          const counts: Record<string, number> = {}
          photoStats.forEach(p => {
            if (p.participant_id) {
              counts[p.participant_id] = (counts[p.participant_id] || 0) + 1
            }
          })
          const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
          if (topId) {
            const topP = participantData.find(p => p.id === topId)
            if (topP) setTopPhotographer(topP.name)
          }
        }
      }

      setLoading(false)
    }

    fetchEventData()
  }, [id, supabase, router])

  const copyJoinLink = () => {
    const url = `${window.location.origin}/${event?.code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) return
    setLoading(true)
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) {
      alert("Failed to delete event: " + error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleRemove = async (participantId: string) => {
    if (!confirm("Remove this participant? Their photos will be kept.")) return
    const result = await removeParticipant(participantId, id as string)
    if (result.success) {
      setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, status: 'removed' } : p))
      setParticipantsCount(prev => prev - 1)
    } else {
      alert(result.error)
    }
  }

  const handleKick = async (participantId: string) => {
    if (!confirm("Kick this participant? Their photos will be DELETED.")) return
    const result = await kickParticipant(participantId, id as string)
    if (result.success) {
      setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, status: 'kicked' } : p))
      setParticipantsCount(prev => prev - 1)
      // Recount photos
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
      setPhotosCount(count || 0)
    } else {
      alert(result.error)
    }
  }

  const handleRevealTimeUpdate = async () => {
    const result = await updateRevealTime(id as string, new Date(newRevealTime).toISOString())
    if (result.success) {
      setEvent((prev: any) => ({ ...prev, reveal_time: new Date(newRevealTime).toISOString() }))
      alert("Reveal time updated!")
    } else {
      alert(result.error)
    }
  }

  const handleToggleLock = async () => {
    const newLockState = !event.is_locked
    const result = await toggleEventLock(id as string, newLockState)
    if (result.success) {
      setEvent((prev: any) => ({ ...prev, is_locked: newLockState }))
    } else {
      alert(result.error)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoStatus("Applying...")
    const result = await applyPromocode(id as string, promoCode)
    if (result.success) {
      setPromoStatus(`✓ Limit increased to ${result.newLimit} photos!`)
      setEvent((prev: any) => ({ ...prev, photo_limit: result.newLimit }))
      setPromoCode("")
    } else {
      setPromoStatus(`✗ ${result.error}`)
    }
    setTimeout(() => setPromoStatus(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="animate-pulse text-stone-400 font-serif italic">Loading vault...</div>
      </div>
    )
  }

  const revealDate = new Date(event.reveal_time)
  const isRevealed = revealDate < new Date()
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/${event.code}` : ''

  return (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/dashboard" className="inline-flex items-center text-stone-500 hover:text-stone-900 transition-colors gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Event Info */}
          <div className="lg:col-span-2 space-y-6">
            <header className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${isRevealed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isRevealed ? 'Revealed' : 'Developing'}
                  </span>
                  {event.is_locked && (
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-red-100 text-red-700">
                      Locked
                    </span>
                  )}
                  <h1 className="text-4xl font-serif text-stone-900 italic capitalize">{event.name}</h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full h-8 px-3 text-xs"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </div>
              <p className="text-stone-500 leading-relaxed">{event.description || "No description provided."}</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-white border-stone-200">
                <CardContent className="pt-5 pb-4">
                  <Calendar className="w-4 h-4 text-stone-400 mb-2" />
                  <p className="text-[9px] uppercase tracking-wider text-stone-400">Reveal</p>
                  <p className="font-medium text-stone-900 text-sm">{revealDate.toLocaleDateString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-stone-200">
                <CardContent className="pt-5 pb-4">
                  <Users className="w-4 h-4 text-stone-400 mb-2" />
                  <p className="text-[9px] uppercase tracking-wider text-stone-400">Participants</p>
                  <p className="font-medium text-stone-900 text-sm">{participantsCount}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-stone-200">
                <CardContent className="pt-5 pb-4">
                  <Camera className="w-4 h-4 text-stone-400 mb-2" />
                  <p className="text-[9px] uppercase tracking-wider text-stone-400">Photos</p>
                  <p className="font-medium text-stone-900 text-sm">{photosCount} / {event.photo_limit}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-stone-200">
                <CardContent className="pt-5 pb-4">
                  <Trophy className="w-4 h-4 text-amber-500 mb-2" />
                  <p className="text-[9px] uppercase tracking-wider text-stone-400">Top Snapper</p>
                  <p className="font-medium text-stone-900 text-sm truncate">{topPhotographer || '—'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Utilization Bar */}
            <Card className="bg-white border-stone-200">
              <CardContent className="pt-5 pb-4 space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-500">ROLL UTILIZATION</span>
                  <span className="text-stone-900">{event.photo_limit > 0 ? Math.round((photosCount / event.photo_limit) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className="bg-stone-900 h-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, event.photo_limit > 0 ? (photosCount / event.photo_limit) * 100 : 0)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Host Controls */}
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-lg font-serif italic">Host Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Lock/Unlock */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-900">Event Lock</p>
                    <p className="text-xs text-stone-500">Prevent new participants from joining</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={event.is_locked ? "secondary" : "destructive"}
                      size="sm"
                      className={`rounded-full text-xs ${event.is_locked ? 'opacity-50 grayscale' : ''}`}
                      disabled={event.is_locked}
                      onClick={handleToggleLock}
                    >
                      <Lock className="w-3.5 h-3.5 mr-1" /> Lock Vault
                    </Button>
                    <Button
                      variant={!event.is_locked ? "secondary" : "outline"}
                      size="sm"
                      className={`rounded-full text-xs ${!event.is_locked ? 'opacity-50 grayscale' : ''}`}
                      disabled={!event.is_locked}
                      onClick={handleToggleLock}
                    >
                      <Unlock className="w-3.5 h-3.5 mr-1" /> Unlock Vault
                    </Button>
                  </div>
                </div>

                <hr className="border-stone-100" />

                {/* Reveal Time */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-900">Reveal Time</p>
                      <p className="text-xs text-stone-500">Adjust when photos are revealed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      value={newRevealTime}
                      onChange={(e) => setNewRevealTime(e.target.value)}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900"
                    />
                    <Button size="sm" className="rounded-full text-xs" onClick={handleRevealTimeUpdate}>
                      <Clock className="w-3.5 h-3.5 mr-1" /> Update
                    </Button>
                  </div>
                </div>

                <hr className="border-stone-100" />

                {/* Promocode */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-stone-900">Apply Promo Code</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter code..."
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono uppercase tracking-wider text-stone-900"
                    />
                    <Button size="sm" className="rounded-full text-xs" onClick={handleApplyPromo}>
                      <Tag className="w-3.5 h-3.5 mr-1" /> Apply
                    </Button>
                  </div>
                  {promoStatus && (
                    <p className={`text-xs ${promoStatus.startsWith('✓') ? 'text-green-600' : promoStatus.startsWith('✗') ? 'text-red-600' : 'text-stone-500'}`}>
                      {promoStatus}
                    </p>
                  )}
                </div>

                <hr className="border-stone-100" />

                {/* Download All */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-900">Download All Photos</p>
                    <p className="text-xs text-stone-500">ZIP archive of all captured photos</p>
                  </div>
                  <a href={`/api/events/${id}/download`} download>
                    <Button size="sm" className="rounded-full text-xs" disabled={photosCount === 0}>
                      <Download className="w-3.5 h-3.5 mr-1" /> Download ZIP
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Participants List */}
            <Card className="bg-white border-stone-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-serif italic">Participants</CardTitle>
                <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => setShowParticipants(!showParticipants)}>
                  <Users className="w-3.5 h-3.5 mr-1" />
                  {showParticipants ? 'Hide' : `View (${participants.length})`}
                </Button>
              </CardHeader>
              {showParticipants && (
                <CardContent>
                  {participants.length === 0 ? (
                    <p className="text-stone-400 text-sm italic text-center py-4">No participants yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {participants.map((p) => (
                        <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                          p.status === 'active' ? 'bg-stone-50 border-stone-200' :
                          p.status === 'removed' ? 'bg-amber-50/50 border-amber-200/50' :
                          'bg-red-50/50 border-red-200/50'
                        }`}>
                          <div>
                            <p className="font-medium text-stone-900 text-sm">{p.name}</p>
                            <p className="text-[10px] text-stone-500">
                              Joined {new Date(p.created_at).toLocaleString()}
                              {p.status !== 'active' && (
                                <span className={`ml-2 uppercase font-bold ${p.status === 'removed' ? 'text-amber-600' : 'text-red-600'}`}>
                                  {p.status}
                                </span>
                              )}
                            </p>
                          </div>
                          {p.status === 'active' && (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-amber-600 hover:bg-amber-50 text-[10px]" onClick={() => handleRemove(p.id)}>
                                <UserMinus className="w-3 h-3 mr-0.5" /> Remove
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-red-600 hover:bg-red-50 text-[10px]" onClick={() => handleKick(p.id)}>
                                <UserX className="w-3 h-3 mr-0.5" /> Kick
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Admin Preview */}
            <Card className="bg-white border-stone-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-serif italic">Admin Preview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={async () => {
                    if (!showPreview && photos.length === 0) {
                      const { data } = await supabase
                        .from('photos')
                        .select('id, telegram_file_id, created_at, participants(name)')
                        .eq('event_id', id)
                        .order('created_at', { ascending: true })
                      
                      // Map the join to a flatter structure for the component
                      const formattedPhotos = data?.map(p => ({
                        ...p,
                        photographer_name: (p.participants as any)?.name
                      })) || []
                      
                      setPhotos(formattedPhotos)
                    }
                    setShowPreview(!showPreview)
                  }}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  {showPreview ? 'Hide' : 'Preview Photos'}
                </Button>
              </CardHeader>
              {showPreview && (
                <CardContent>
                  {photos.length === 0 ? (
                    <p className="text-stone-400 text-sm italic py-4 text-center">No photos captured yet.</p>
                  ) : (
                    <GalleryGrid photos={photos} isRevealing={false} />
                  )}
                </CardContent>
              )}
            </Card>

          </div>

          {/* Right: Join QR & Links */}
          <div className="space-y-6">
            <Card className="bg-white border-stone-900 border-2 overflow-hidden">
              <CardHeader className="bg-stone-900 text-stone-50 text-center py-4">
                <CardTitle className="text-xl font-serif italic">Join Vault</CardTitle>
                <CardDescription className="text-stone-400">Share this with your guests</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center space-y-6">
                <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-inner">
                  <QRCodeSVG value={joinUrl} size={180} level="H" />
                </div>

                <div className="w-full space-y-3">
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Event Code</p>
                    <p className="text-2xl font-mono font-bold tracking-[0.2em] text-stone-900">{event.code}</p>
                  </div>

                  <Button
                    onClick={copyJoinLink}
                    className={`w-full rounded-full transition-all ${copied ? 'bg-green-600' : 'bg-stone-900 hover:bg-stone-800'}`}
                  >
                    {copied ? (
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Copied!</span>
                    ) : (
                      <span className="flex items-center gap-2"><Copy className="w-4 h-4" /> Copy Join Link</span>
                    )}
                  </Button>

                  <Link href={`/${event.code}`} target="_blank" className="w-full">
                    <Button variant="outline" className="w-full rounded-full border-stone-300 text-stone-700 mt-2">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open Guest View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
