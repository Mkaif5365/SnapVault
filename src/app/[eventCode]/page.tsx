"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRightIcon, CameraIcon, ImagesIcon, LockIcon, SpinnerGapIcon, UploadSimpleIcon } from "@phosphor-icons/react"
import { Logo, LogoMark } from "@/components/brand/Logo"
import { StatusBadge } from "@/components/app/StatusBadge"
import DevelopingScreen from "@/components/event/DevelopingScreen"
import GalleryGrid from "@/components/event/GalleryGrid"
import { uploadMedia } from "@/lib/media/upload-media"
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/media/limits"

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
  const [perFileProgress, setPerFileProgress] = useState(0)
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
          .select('id, telegram_file_id, created_at, media_type, mime_type')
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
    setPerFileProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // 2. Size limit (Telegram bots can only read back files up to 20MB)
      if (file.size > MAX_UPLOAD_BYTES) {
        alert(`File "${file.name}" is too large (max ${MAX_UPLOAD_LABEL}). Skipping.`)
        continue
      }

      setUploadProgress(prev => ({ ...prev, current: i + 1 }))
      setPerFileProgress(0)

      const isVideo = file.type.startsWith('video/')

      try {
        await uploadMedia(
          file,
          file.name,
          {
            eventId: event.id,
            participantId: participant?.id || "",
            mediaType: isVideo ? "video" : "photo",
            mimeType: file.type,
            photographerName: participant?.name || "Guest",
          },
          setPerFileProgress
        )
        setPhotosCount(prev => prev + 1)
      } catch (err: any) {
        console.error(`Failed to upload ${file.name}:`, err.message)
      }
    }

    setUploading(false)
    setPerFileProgress(0)
    alert("Upload completed!")
  }

  // HUB STATE
  if (pageState === 'hub' && event && participant) {
    const usedPct = event.photo_limit > 0 ? Math.min(100, (photosCount / event.photo_limit) * 100) : 0
    const totalPct = uploadProgress.total > 0
      ? Math.round(((uploadProgress.current - 1) / uploadProgress.total) * 100 + (perFileProgress / uploadProgress.total))
      : 0

    return (
      <GuestFrame>
        <div className="flex items-center justify-between">
          <Logo href={null} />
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-white/[0.05] pr-3 pl-1 text-sm text-ink-200">
            <span className="grid size-6 place-items-center rounded-full bg-ink-700 text-xs font-semibold">
              {participant.name?.charAt(0)?.toUpperCase()}
            </span>
            {participant.name}
          </span>
        </div>

        <div className="mt-12">
          <StatusBadge status="developing" />
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-bold tracking-[-0.035em] break-words text-ink-100">
            {event.name}
          </h1>
          <p className="mt-3 text-ink-400">Every shot stays hidden until the reveal. Make them count.</p>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            onClick={() => router.push(`/${eventCode}/camera`)}
            size="xl"
            className="group h-20 w-full justify-between rounded-[20px] px-6 text-lg"
          >
            <span className="flex items-center gap-3">
              <CameraIcon weight="fill" className="size-6" />
              Open camera
            </span>
            <ArrowRightIcon weight="bold" className="size-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              aria-label="Upload photos or videos"
              className="absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
            <div className="surface flex h-16 items-center justify-between px-5">
              <span className="flex items-center gap-3 text-ink-100">
                {uploading ? <SpinnerGapIcon className="size-5 animate-spin text-flare-400" /> : <UploadSimpleIcon className="size-5 text-ink-300" />}
                <span className="font-medium">{uploading ? 'Uploading...' : 'Upload from your phone'}</span>
              </span>
              <span className="text-xs text-ink-400">Max {MAX_UPLOAD_LABEL} each</span>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => setPageState('developing')}
            className="h-14 w-full justify-between rounded-[20px] px-5 text-base"
          >
            <span className="flex items-center gap-3">
              <ImagesIcon className="size-5" />
              See the vault
            </span>
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>

        {uploading && (
          <div className="surface mt-4 p-5" role="status" aria-live="polite">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-200">File {uploadProgress.current} of {uploadProgress.total}</span>
              <span className="tabular font-mono text-flare-400">{perFileProgress}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-950">
              <div className="h-full rounded-full bg-flare-500 transition-[width] duration-300 ease-out" style={{ width: `${perFileProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-400">Overall {totalPct}%</p>
          </div>
        )}

        <div className="mt-auto pt-12">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-ink-400">Shots on the roll</span>
            <span className="tabular font-mono text-ink-100">{photosCount} / {event.photo_limit}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-800">
            <div className="h-full rounded-full bg-ink-300" style={{ width: `${usedPct}%` }} />
          </div>
        </div>
      </GuestFrame>
    )
  }

  // LOADING STATE
  if (pageState === 'loading') {
    return (
      <div className="grid min-h-[100dvh] place-items-center p-6" aria-busy="true">
        <div className="flex flex-col items-center gap-4">
          <LogoMark className="size-12 animate-pulse" />
          <p className="text-sm text-ink-400">Opening the vault</p>
        </div>
      </div>
    )
  }

  // LOCKED STATE
  if (pageState === 'locked' && event) {
    return (
      <GuestFrame>
        <Logo href={null} />
        <div className="my-auto py-16 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-[20px] bg-ink-800 text-ink-200 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
            <LockIcon className="size-7" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-[-0.03em] break-words text-ink-100">{event.name}</h1>
          <p className="mx-auto mt-3 max-w-[32ch] text-ink-400">
            The host has closed entry to this vault. No new guests can join right now.
          </p>
        </div>
      </GuestFrame>
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
      <div className="min-h-[100dvh]">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <Logo href="/" />
          <header className="py-12 md:py-16">
            <StatusBadge status="revealed" />
            <h1 className="mt-4 font-display text-4xl leading-[1.02] font-bold tracking-[-0.04em] break-words text-ink-100 md:text-6xl">
              {event.name}
            </h1>
            <p className="mt-4 max-w-[56ch] text-lg text-ink-400">
              {photos.length} {photos.length === 1 ? 'shot' : 'shots'}, developed for everyone at once.
              {event.description ? ` ${event.description}` : ''}
            </p>
          </header>
          <GalleryGrid photos={photos} isRevealing={isRevealing} />
          <footer className="flex items-center justify-between border-t border-white/[0.06] py-10 mt-16 text-sm text-ink-400">
            <span>Tap any shot to view or download it.</span>
            <span>Made with SnapVault</span>
          </footer>
        </div>
      </div>
    )
  }

  // JOIN STATE (Default)
  return (
    <GuestFrame>
      <Logo href={null} />

      <div className="my-auto py-10">
        {/* Unexposed prints: the roll is waiting */}
        <div aria-hidden className="relative mx-auto h-44 w-full max-w-[280px] [perspective:900px]">
          {[-12, 2, 14].map((r, i) => (
            <div
              key={r}
              className="print absolute top-1/2 left-1/2 w-28"
              style={{ transform: `translate(-50%, -50%) translateX(${(i - 1) * 58}px) rotateX(14deg) rotateY(-16deg) rotateZ(${r}deg) translateZ(${i * 18}px)` }}
            >
              <div className="flex aspect-[4/5] items-end justify-end rounded-[2px] bg-gradient-to-br from-ink-800 to-ink-950 p-1.5">
                <span className="stamp text-[9px] opacity-70">&apos;-- -- --</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-ink-400">You&apos;re invited to</p>
        <h1 className="mt-2 text-center font-display text-4xl leading-[1.05] font-bold tracking-[-0.035em] break-words text-ink-100">
          {event?.name}
        </h1>

        <form onSubmit={handleJoin} className="mt-10 space-y-5">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-[13px] font-medium text-ink-200">Your name</label>
            <Input
              id="name"
              placeholder="e.g. Aunt Priya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              autoComplete="given-name"
              aria-describedby="name-help"
              className="h-12 text-base"
            />
            <p id="name-help" className="text-[13px] text-ink-400">It goes on every photo you take.</p>
          </div>

          <Button
            type="submit"
            size="xl"
            disabled={joining || !name.trim()}
            className="group w-full"
          >
            {joining ? (
              <SpinnerGapIcon className="size-5 animate-spin" />
            ) : (
              <>
                Join the vault
                <ArrowRightIcon weight="bold" className="size-5 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-ink-400">Nobody sees the photos until the host&apos;s reveal time.</p>
    </GuestFrame>
  )
}

/** Narrow, phone-first frame shared by the guest screens. */
function GuestFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[640px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(236_106_46/0.12),transparent)]" />
      <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 py-6">
        {children}
      </main>
    </div>
  )
}
