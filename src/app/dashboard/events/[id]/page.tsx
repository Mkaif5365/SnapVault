"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, ExternalLink, Calendar, Camera, Users, CheckCircle2, Trash2, Eye, Download, Lock, Unlock, Clock, Trophy, UserX, UserMinus, Tag, Plus, Trash } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import GalleryGrid from "@/components/event/GalleryGrid"
import { removeParticipant, kickParticipant, updateRevealTime, toggleEventLock, applyPromocode, deleteMedia } from "@/lib/actions/host"
import { uploadMediaToTelegram } from "@/lib/telegram/actions"

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
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchEventData() {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 2. Fetch event with host_id filter
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('host_id', user.id)
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

  const handleDeleteMedia = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return
    const result = await deleteMedia(photoId, id as string)
    if (result.success) {
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      setPhotosCount(prev => prev - 1)
    } else {
      alert(result.error)
    }
  }

  const handleHostUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress({})
    let uploadedCount = 0

    const uploadFile = (file: File) => {
      return new Promise<boolean>((resolve) => {
        const xhr = new XMLHttpRequest()
        const formData = new FormData()
        formData.append('media', file)
        formData.append('eventId', id as string)
        formData.append('photographerName', 'Host')
        
        const mediaType = file.type.startsWith('video/') ? 'video' : 'photo'
        formData.append('mediaType', mediaType)
        formData.append('mimeType', file.type)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(prev => ({ ...prev, [file.name]: percentComplete }))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(true)
          } else {
            console.error('Upload failed', xhr.responseText)
            resolve(false)
          }
        }

        xhr.onerror = () => {
          console.error('XHR error')
          resolve(false)
        }

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })
    }

    for (const file of Array.from(files)) {
      const success = await uploadFile(file)
      if (success) {
        uploadedCount++
      }
    }

    if (uploadedCount > 0) {
      // Refresh photo list
      const { data: newPhotos } = await supabase
        .from('photos')
        .select('id, telegram_file_id, created_at, media_type, mime_type, participants(name)')
        .eq('event_id', id)
        .order('created_at', { ascending: false })
      
      const formattedPhotos = newPhotos?.map(p => ({
        ...p,
        photographer_name: (p.participants as any)?.name
      })) || []
      
      setPhotos(formattedPhotos)
      setPhotosCount(newPhotos?.length || 0)
    }

    setIsUploading(false)
    setUploadProgress({})
  }

  const handleOpenCamera = () => {
    router.push(`/${event.code}/camera?host=1`)
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
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 font-sans antialiased relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-900/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <Link href="/dashboard" className="inline-flex items-center text-stone-500 hover:text-amber-500 transition-all gap-2 text-[10px] uppercase tracking-[0.2em] font-mono group">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Event Info */}
          <div className="lg:col-span-2 space-y-8">
            <header className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4 max-w-full overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`text-[8px] sm:text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-mono font-bold ${isRevealed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                      {isRevealed ? 'Revealed' : 'Developing'}
                    </span>
                    {event.is_locked && (
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-mono font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                        Locked
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-serif text-stone-100 italic tracking-tight leading-tight capitalize break-words">{event.name}</h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-stone-600 hover:text-red-400 transition-colors h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-[10px] sm:text-xs font-mono uppercase tracking-wider shrink-0"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Delete Event</span>
                  <span className="xs:hidden">Delete</span>
                </Button>
              </div>
              <p className="text-stone-400 text-lg leading-relaxed font-light max-w-2xl">{event.description || "No description provided."}</p>
            </header>

            {/* Stats Cards */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl">
                <CardContent className="pt-5 pb-4 sm:pt-6 sm:pb-5 flex flex-col items-center">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600 mb-2 sm:mb-3" />
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-stone-500 font-mono mb-1">Reveal</p>
                  <p className="font-medium text-stone-100 text-xs sm:text-sm">{revealDate.toLocaleDateString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl">
                <CardContent className="pt-5 pb-4 sm:pt-6 sm:pb-5 flex flex-col items-center">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600 mb-2 sm:mb-3" />
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-stone-500 font-mono mb-1">Guests</p>
                  <p className="font-medium text-stone-100 text-xs sm:text-sm">{participantsCount}</p>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl">
                <CardContent className="pt-5 pb-4 sm:pt-6 sm:pb-5 flex flex-col items-center">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600 mb-2 sm:mb-3" />
                   <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-stone-500 font-mono mb-1">Media</p>
                  <p className="font-medium text-stone-100 text-xs sm:text-sm">{photosCount} / {event.photo_limit}</p>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl">
                <CardContent className="pt-5 pb-4 sm:pt-6 sm:pb-5 flex flex-col items-center">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500/70 mb-2 sm:mb-3" />
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-stone-500 font-mono mb-1">Best Shot</p>
                  <p className="font-medium text-stone-100 text-xs sm:text-sm truncate w-full text-center px-1">{topPhotographer || '—'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Utilization Bar */}
            <Card className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl overflow-hidden">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-[0.2em]">
                  <span className="text-stone-500">Roll Utilization</span>
                  <span className="text-amber-500">{event.photo_limit > 0 ? Math.round((photosCount / event.photo_limit) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-900 inner-shadow">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    style={{ width: `${Math.min(100, event.photo_limit > 0 ? (photosCount / event.photo_limit) * 100 : 0)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Host Controls */}
            <Card className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl">
              <CardHeader className="border-b border-stone-800/50 pb-4">
                <CardTitle className="text-xl font-serif italic text-stone-100 tracking-tight">Event Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 p-0">
                {/* Lock/Unlock */}
                <div className="flex items-center justify-between p-6 hover:bg-stone-800/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-100">Vault Security</p>
                    <p className="text-xs text-stone-500 mt-0.5">Control entrance to the digital vault</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {event?.is_locked ? (
                      <Button
                        key="unlock-btn"
                        variant="outline"
                        size="sm"
                        className="rounded-full text-[10px] uppercase tracking-wider font-mono border-stone-700 bg-stone-900 text-stone-100 hover:bg-stone-800 transition-all active:scale-95"
                        onClick={handleToggleLock}
                      >
                        <Unlock className="w-3 h-3 mr-2" /> Open Entry
                      </Button>
                    ) : (
                      <Button
                        key="lock-btn"
                        size="sm"
                        className="rounded-full text-[10px] uppercase tracking-wider font-mono bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20 hover:text-red-400 transition-all active:scale-95"
                        onClick={handleToggleLock}
                      >
                        <Lock className="w-3 h-3 mr-2" /> Close Entry
                      </Button>
                    )}
                  </div>
                </div>

                <div className="h-px bg-stone-800/50 mx-6" />

                 {/* Reveal Time */}
                <div className="p-6 space-y-4 hover:bg-stone-800/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-100">Reveal Timer</p>
                    <p className="text-xs text-stone-500 mt-0.5">Adjust when photos are automatically revealed</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
                    <input
                      type="datetime-local"
                      value={newRevealTime}
                      onChange={(e) => setNewRevealTime(e.target.value)}
                      className="flex-1 bg-stone-950/50 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500/50"
                    />
                    <Button size="sm" className="bg-amber-500 text-stone-950 hover:bg-amber-400 rounded-xl px-6 py-2.5 h-auto text-[11px] font-bold shrink-0 shadow-lg shadow-amber-500/10 active:scale-95 transition-all" onClick={handleRevealTimeUpdate}>
                      Set Timer
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-stone-800/50 mx-6" />

                {/* Promocode */}
                <div className="p-6 space-y-4 hover:bg-stone-800/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-100">Photo Capacity</p>
                    <p className="text-xs text-stone-500 mt-0.5">Use codes to increase photo limit</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="ENTER PROMOCODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-stone-950/50 border border-stone-800 rounded-xl px-4 py-2 text-sm font-mono uppercase tracking-widest text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500/50"
                    />
                    <Button size="sm" className="bg-stone-800 text-stone-100 hover:bg-stone-700 rounded-xl px-5 text-[11px] font-bold" onClick={handleApplyPromo}>
                      Apply
                    </Button>
                  </div>
                  {promoStatus && (
                    <p className={`text-[10px] uppercase tracking-widest font-mono text-center ${promoStatus.startsWith('✓') ? 'text-green-400' : promoStatus.startsWith('✗') ? 'text-red-400' : 'text-stone-500'}`}>
                      {promoStatus}
                    </p>
                  )}
                </div>

                <div className="h-px bg-stone-800/50 mx-6" />

                {/* Download All */}
                <div className="flex items-center justify-between p-6 hover:bg-stone-800/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-100">Batch Export</p>
                    <p className="text-xs text-stone-500 mt-0.5">Export all media as a ZIP archive</p>
                  </div>
                  <a href={`/api/events/${id}/download`} download>
                    <Button variant="outline" size="sm" className="rounded-full text-[10px] uppercase tracking-wider font-mono border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-100" disabled={photosCount === 0}>
                      <Download className="w-3.5 h-3.5 mr-2" /> ZIP Archive
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Participants List */}
            <Card className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-stone-800/50 pb-4">
                <CardTitle className="text-xl font-serif italic text-stone-100 tracking-tight">Participant List</CardTitle>
                <Button variant="ghost" size="sm" className="rounded-full text-[10px] uppercase tracking-[0.2em] font-mono text-stone-500 hover:text-amber-500" onClick={() => setShowParticipants(!showParticipants)}>
                  <Users className="w-3.5 h-3.5 mr-2" />
                  {showParticipants ? 'Close' : `View (${participants.length})`}
                </Button>
              </CardHeader>
              {showParticipants && (
                <CardContent className="pt-6">
                  {participants.length === 0 ? (
                    <p className="text-stone-600 text-xs italic text-center py-4 font-mono uppercase tracking-widest">No active participants</p>
                  ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                         {participants.map((p) => (
                          <div key={p.id} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all ${
                            p.status === 'active' ? 'bg-stone-950/30 border-stone-800 hover:border-stone-700' :
                            p.status === 'removed' ? 'bg-amber-950/10 border-amber-900/20 opacity-50' :
                            'bg-red-950/10 border-red-900/20 opacity-50'
                          }`}>
                            <div className="space-y-1 overflow-hidden">
                              <p className="font-medium text-stone-100 text-xs sm:text-sm leading-none truncate">{p.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[8px] sm:text-[9px] text-stone-500 font-mono tracking-wider uppercase">
                                  {new Date(p.created_at).toLocaleDateString()}
                                </p>
                                {p.status !== 'active' && (
                                  <span className={`text-[8px] px-1 py-0.5 rounded font-mono uppercase font-bold border ${p.status === 'removed' ? 'text-amber-600 border-amber-900/40 bg-amber-900/10' : 'text-red-500 border-red-900/40 bg-red-900/10'}`}>
                                    {p.status}
                                  </span>
                                )}
                              </div>
                            </div>
                            {p.status === 'active' && (
                              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-amber-600/70 hover:text-amber-500 hover:bg-amber-500/10 text-[9px] sm:text-[10px] font-mono uppercase" onClick={() => handleRemove(p.id)}>
                                  Remove
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-red-600/70 hover:text-red-500 hover:bg-red-500/10 text-[9px] sm:text-[10px] font-mono uppercase" onClick={() => handleKick(p.id)}>
                                  Kick
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
            <Card className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-800/50 pb-4 gap-4 sm:gap-0">
                <CardTitle className="text-xl font-serif italic text-stone-100 tracking-tight">Media Preview</CardTitle>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <input
                    type="file"
                    id="host-upload"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleHostUpload}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 sm:flex-none rounded-full text-[10px] uppercase tracking-[0.2em] font-mono text-stone-500 hover:text-amber-500 border border-stone-800 sm:border-transparent"
                    onClick={() => document.getElementById('host-upload')?.click()}
                  >
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    <span className="xs:inline">Upload</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 sm:flex-none rounded-full text-[10px] uppercase tracking-[0.2em] font-mono text-stone-500 hover:text-amber-500 border border-stone-800 sm:border-transparent"
                    onClick={handleOpenCamera}
                  >
                    <Camera className="w-3.5 h-3.5 mr-2" />
                    <span className="xs:inline">Camera</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 sm:flex-none rounded-full text-[10px] uppercase tracking-[0.2em] font-mono text-stone-500 hover:text-amber-500 border border-stone-800 sm:border-transparent"
                    onClick={async () => {
                      if (!showPreview && photos.length === 0) {
                        const { data } = await supabase
                          .from('photos')
                          .select('id, telegram_file_id, created_at, media_type, mime_type, participants(name)')
                          .eq('event_id', id)
                          .order('created_at', { ascending: false })
                        
                        const formattedPhotos = data?.map(p => ({
                          ...p,
                          photographer_name: (p.participants as any)?.name
                        })) || []
                        
                        setPhotos(formattedPhotos)
                      }
                      setShowPreview(!showPreview)
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    <span className="xs:inline">{showPreview ? 'Close' : `View (${photosCount})`}</span>
                  </Button>
                </div>
              </CardHeader>
               {isUploading && (
                <div className="p-6 border-b border-stone-800/50 bg-amber-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-amber-500 animate-pulse">
                      Vault Upload in progress...
                    </p>
                    <span className="text-amber-500 font-mono text-[10px]">
                      {Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(uploadProgress).length)}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden border border-stone-900 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      style={{ width: `${Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(uploadProgress).length)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(uploadProgress).map(([name, progress]) => (
                      <div key={name} className="flex items-center gap-1.5 bg-stone-900/50 px-2 py-1 rounded-md border border-stone-800">
                        <span className="text-[8px] font-mono text-stone-500 truncate max-w-[80px]">{name}</span>
                        <span className="text-[8px] font-mono text-amber-500">{progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showPreview && (
                <CardContent className="pt-6">
                  {photos.length === 0 ? (
                    <p className="text-stone-600 text-xs italic py-8 text-center font-mono uppercase tracking-widest">No media captured yet</p>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      <GalleryGrid 
                        photos={photos} 
                        isRevealing={false} 
                        showDelete={true}
                        onDelete={handleDeleteMedia}
                      />
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

          </div>

          {/* Right: Join QR & Links */}
          <div className="space-y-6">
            <Card className="bg-stone-900 border border-stone-800 overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
              <CardHeader className="text-center py-6 border-b border-stone-800/50">
                <CardTitle className="text-2xl font-serif italic text-stone-100">Guest Access</CardTitle>
                <CardDescription className="text-stone-500 text-xs">Share this QR with your participants</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center space-y-8">
                <div className="p-4 sm:p-5 bg-white rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/10 group transition-all hover:scale-105 active:scale-95 cursor-pointer max-w-full">
                  <QRCodeSVG value={joinUrl} size={160} level="H" className="w-full h-auto max-w-[180px]" />
                </div>

                <div className="w-full space-y-4">
                  <div className="bg-stone-950/50 border border-stone-800 rounded-2xl p-3 sm:p-4 text-center">
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-stone-600 font-mono mb-1.5 sm:mb-2 text-center">Access Token</p>
                    <p className="text-2xl sm:text-3xl font-mono font-bold tracking-[0.2em] text-stone-100 select-all">{event.code}</p>
                  </div>

                  <Button
                    onClick={copyJoinLink}
                    className={`w-full h-11 sm:h-12 rounded-2xl transition-all font-bold text-xs sm:text-sm ${copied ? 'bg-green-600 text-white' : 'bg-amber-500 text-stone-950 hover:bg-amber-400'}`}
                  >
                    {copied ? (
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-2"><Copy className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> Copy Access Link</span>
                    )}
                  </Button>

                  <Link href={`/${event.code}`} target="_blank" className="w-full">
                    <Button variant="outline" className="w-full h-11 sm:h-12 rounded-2xl border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-all font-medium text-xs sm:text-sm">
                      <ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" /> Open Guest View
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <div className="bg-stone-950/50 p-4 text-center border-t border-stone-800/50">
                <p className="text-[8px] font-mono text-stone-700 uppercase tracking-widest">SnapVault Premium</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
