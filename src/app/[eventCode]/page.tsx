"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Loader2, ArrowRight, Image as ImageIcon } from "lucide-react"
import DevelopingScreen from "@/components/event/DevelopingScreen"
import GalleryGrid from "@/components/event/GalleryGrid"

type PageState = 'loading' | 'join' | 'hub' | 'developing' | 'revealed' | 'locked'

export default function GuestEventPage() {
  const { eventCode } = useParams()
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [event, setEvent] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [photosCount, setPhotosCount] = useState(0)
  const [name, setName] = useState("")
  const [joining, setJoining] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [participant, setParticipant] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const savedName = localStorage.getItem("snapvault_name")
    if (savedName) setName(savedName)

    async function fetchEvent() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('code', (eventCode as string).toUpperCase())
        .single()

      if (error || !data) {
        console.error(error)
        router.push('/')
        return
      }

      setEvent(data)

      // Count photos
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', data.id)

      setPhotosCount(count || 0)

      // Check if revealed
      const revealTime = new Date(data.reveal_time)
      const now = new Date()

      if (revealTime <= now) {
        // Fetch all photos for the gallery
        const { data: photoData } = await supabase
          .from('photos')
          .select('id, telegram_file_id, created_at')
          .eq('event_id', data.id)
          .order('created_at', { ascending: true })

        setPhotos(photoData || [])
        setIsRevealing(true)
        setPageState('revealed')

        // Remove the reveal animation after it plays
        setTimeout(() => setIsRevealing(false), (photoData?.length || 0) * 100 + 2000)
      } else {
        // Check if user already joined (has name saved for this event)
        const participantId = localStorage.getItem(`participant_${data.id}`)
        if (participantId) {
          // Fetch participant details to be sure
          const { data: pData } = await supabase
            .from('participants')
            .select('*')
            .eq('id', participantId)
            .single()
          
          if (pData) {
            setParticipant(pData)
            setPageState('hub')
            return
          }
        }
        
        if (data.is_locked) {
          setPageState('locked')
        } else {
          setPageState('join')
        }
      }
    }

    fetchEvent()
  }, [eventCode, supabase, router])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setJoining(true)
    localStorage.setItem("snapvault_name", name.trim())

    const { data: pData, error } = await supabase
      .from('participants')
      .insert({
        event_id: event.id,
        name: name.trim(),
        session_id: Math.random().toString(36).substring(7)
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      alert("Failed to join event.")
      setJoining(false)
    } else {
      localStorage.setItem(`participant_${event.id}`, pData.id)
      setParticipant(pData)
      setPageState('hub')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 1. Check event limit
    if (photosCount >= event.photo_limit) {
      alert("This vault is full! No more photos can be added.")
      return
    }

    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })

    const { uploadPhotoToTelegram } = await import("@/lib/telegram/actions")

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // 2. Size limit: 20MB
      if (file.size > 20 * 1024 * 1024) {
        alert(`File "${file.name}" is too large (max 20MB). Skipping.`)
        continue
      }

      setUploadProgress(prev => ({ ...prev, current: i + 1 }))

      const formData = new FormData()
      formData.append("file", file)
      formData.append("eventId", event.id)
      formData.append("participantId", participant.id)

      const result = await uploadPhotoToTelegram(formData)
      if (result.error) {
        console.error(`Failed to upload ${file.name}:`, result.error)
      } else {
        setPhotosCount(prev => prev + 1)
      }
    }

    setUploading(false)
    alert("Upload completed!")
  }

  // HUB STATE
  if (pageState === 'hub' && event && participant) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 antialiased">
        <Card className="w-full max-w-md bg-stone-50 border-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-black flex justify-around items-center px-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-stone-800 rounded-sm" />
            ))}
          </div>

          <CardHeader className="pt-10 pb-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-mono mb-2">Guest Hub</p>
            <CardTitle className="text-3xl font-serif italic text-stone-900">{event.name}</CardTitle>
            <CardDescription className="text-stone-500 mt-1">
              Welcome, <span className="text-stone-900 font-semibold">{participant.name}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-10">
            {uploading && (
              <div className="bg-stone-900 text-stone-50 p-4 rounded-xl space-y-2 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-mono">
                  <span>Uploading Snaps...</span>
                  <span>{uploadProgress.current} / {uploadProgress.total}</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => router.push(`/${eventCode}/camera`)}
                className="h-16 bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-xl flex items-center justify-between px-6 group"
              >
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5" />
                  <span className="text-lg">Open Camera</span>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>

              <div className="relative">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Button 
                  variant="outline"
                  className="w-full h-16 border-2 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl flex items-center justify-between px-6"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className={`w-5 h-5 ${uploading ? 'animate-spin' : ''}`} />
                    <span className="text-lg">{uploading ? 'Uploading...' : 'Upload Photos'}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-stone-400">Max 20MB</span>
                </Button>
              </div>

              <Button 
                variant="ghost"
                onClick={() => setPageState('developing')}
                className="h-16 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl flex items-center justify-between px-6"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-lg">View Gallery</span>
                </div>
              </Button>
            </div>

            <div className="pt-4 text-center">
              <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em]">
                {photosCount} / {event.photo_limit} SNAPS CAPTURED
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // LOADING STATE
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6">
        <div className="text-stone-500 font-serif italic text-xl animate-pulse">
          Opening Lens...
        </div>
      </div>
    )
  }

  // LOCKED STATE
  if (pageState === 'locked' && event) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-stone-800 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-serif italic text-stone-200">{event.name}</h2>
          <p className="text-stone-500">This vault has been locked by the host.</p>
          <p className="text-stone-600 text-sm">No new participants can join at this time.</p>
        </div>
      </div>
    )
  }

  // DEVELOPING STATE (Dark Room)
  if (pageState === 'developing' && event) {
    return (
      <DevelopingScreen
        eventName={event.name}
        revealTime={event.reveal_time}
        photosCount={photosCount}
        photoLimit={event.photo_limit}
        onBack={() => setPageState('hub')}
      />
    )
  }

  // REVEALED STATE (Gallery)
  if (pageState === 'revealed' && event) {
    return (
      <div className="min-h-screen bg-stone-100 p-4 md:p-8 font-sans">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="text-center space-y-3 py-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-mono">Vault Revealed</p>
            <h1 className="text-5xl font-serif italic text-stone-900">{event.name}</h1>
            <p className="text-stone-500 text-sm">
              {photos.length} photos — captured by {event.description || 'your crew'}
            </p>
          </header>
          <GalleryGrid photos={photos} isRevealing={isRevealing} />
          <footer className="text-center py-8">
            <p className="text-[9px] text-stone-400 tracking-[0.4em] uppercase font-mono">
              SnapVault // Revealed
            </p>
          </footer>
        </div>
      </div>
    )
  }

  // JOIN STATE (Default)
  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 antialiased">
      <Card className="w-full max-w-md bg-stone-50 border-none shadow-2xl relative overflow-hidden">
        {/* Film strip decoration */}
        <div className="absolute top-0 left-0 w-full h-4 bg-black flex justify-around items-center px-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-stone-800 rounded-sm" />
          ))}
        </div>

        <CardHeader className="pt-10 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center text-stone-50 shadow-lg overflow-hidden">
              <img src="/logo.png" alt="SnapVault" className="w-12 h-12 object-contain" />
            </div>
          </div>
          <CardTitle className="text-4xl font-serif italic text-stone-900">SnapVault</CardTitle>
          <CardDescription className="text-stone-500 mt-2">
            You've been invited to <span className="text-stone-900 font-semibold italic">"{event?.name}"</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-10">
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs uppercase tracking-widest text-stone-400 font-bold ml-1">
                Your Calling Name
              </label>
              <Input
                id="name"
                placeholder="How should we label your photos?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="h-14 bg-white border-stone-200 text-lg focus-visible:ring-stone-400 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={joining || !name.trim()}
              className="w-full h-14 bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-xl text-lg font-medium group transition-all"
            >
              {joining ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Enter Event <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] text-stone-300 uppercase tracking-[0.2em]">
            Disposable Camera Experience
          </p>
        </CardContent>
      </Card>

      <footer className="mt-8 text-stone-600 text-xs italic font-serif">
        &copy; SnapVault AI
      </footer>
    </div>
  )
}
