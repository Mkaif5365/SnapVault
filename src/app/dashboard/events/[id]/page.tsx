"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, ArrowUpRightIcon, CalendarBlankIcon, CameraIcon, CheckIcon, CopyIcon, DownloadSimpleIcon, EyeIcon, EyeSlashIcon, LockIcon, LockOpenIcon, TrashIcon, TrophyIcon, UploadSimpleIcon, UsersThreeIcon } from "@phosphor-icons/react"
import { AppHeader } from "@/components/app/AppHeader"
import { StatusBadge } from "@/components/app/StatusBadge"
import { cn } from "@/lib/utils"
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
        formData.append('file', file)
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
        photographer_name: (p.participants as any)?.name || 'Host'
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
      <div className="min-h-[100dvh]" aria-busy="true" aria-label="Loading vault">
        <AppHeader />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:px-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="h-6 w-28 animate-pulse rounded-full bg-ink-800" />
            <div className="h-14 w-3/4 animate-pulse rounded-2xl bg-ink-800" />
            <div className="h-28 animate-pulse rounded-[20px] bg-ink-900" />
            <div className="h-72 animate-pulse rounded-[20px] bg-ink-900" />
          </div>
          <div className="h-[520px] animate-pulse rounded-[20px] bg-ink-900" />
        </div>
      </div>
    )
  }

  const revealDate = new Date(event.reveal_time)
  const isRevealed = revealDate < new Date()
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/${event.code}` : ''
  const usedPct = event.photo_limit > 0 ? Math.min(100, Math.round((photosCount / event.photo_limit) * 100)) : 0
  const uploadPct = Math.round(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(uploadProgress).length))
  const stats = [
    { icon: CalendarBlankIcon, label: "Reveal", value: revealDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }), sub: revealDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    { icon: UsersThreeIcon, label: "Guests", value: participantsCount, sub: "joined" },
    { icon: CameraIcon, label: "Shots", value: photosCount, sub: `of ${event.photo_limit}` },
    { icon: TrophyIcon, label: "Top shooter", value: topPhotographer || "None yet", sub: "most shots" },
  ]

  return (
    <div className="min-h-[100dvh]">
      <AppHeader>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${event.code}`} target="_blank">
            Guest view
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </AppHeader>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <Link href="/dashboard" className="group inline-flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-ink-100">
          <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
          All vaults
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={isRevealed ? "revealed" : "developing"} />
                {event.is_locked && <StatusBadge status="locked" />}
              </div>
              <h1 className="mt-4 font-display text-4xl leading-[1.05] font-bold tracking-[-0.035em] break-words text-ink-100 md:text-5xl">
                {event.name}
              </h1>
              <p className="mt-3 max-w-[60ch] text-ink-400">{event.description || "No description yet."}</p>
            </header>

            <section aria-label="Vault stats" className="surface grid grid-cols-2 divide-white/[0.06] sm:grid-cols-4 sm:divide-x">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-0 p-5">
                  <p className="flex items-center gap-1.5 text-xs text-ink-400">
                    <stat.icon className="size-3.5" /> {stat.label}
                  </p>
                  <p className="tabular mt-2 truncate font-display text-2xl font-semibold tracking-[-0.02em] text-ink-100">{stat.value}</p>
                  <p className="text-xs text-ink-400">{stat.sub}</p>
                </div>
              ))}
            </section>

            <section aria-label="Roll used" className="surface p-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink-300">Roll used</span>
                <span className="tabular font-mono text-ink-100">{usedPct}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-950 shadow-[inset_0_1px_2px_rgb(0_0_0/0.6)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-flare-600 to-flare-400 transition-[width] duration-1000 ease-out-expo"
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </section>

            <section className="surface">
              <h2 className="px-6 pt-6 font-display text-xl font-semibold tracking-[-0.02em] text-ink-100">Controls</h2>
              <div className="mt-2 divide-y divide-white/[0.06]">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink-100">Guest entry</p>
                    <p className="mt-0.5 text-sm text-ink-400">
                      {event?.is_locked ? "Entry is closed. Guests who already joined can keep shooting." : "Anyone with the code can join."}
                    </p>
                  </div>
                  {event?.is_locked ? (
                    <Button key="unlock-btn" variant="secondary" size="sm" onClick={handleToggleLock}>
                      <LockOpenIcon /> Open entry
                    </Button>
                  ) : (
                    <Button key="lock-btn" variant="destructive" size="sm" onClick={handleToggleLock}>
                      <LockIcon /> Close entry
                    </Button>
                  )}
                </div>

                <div className="space-y-3 p-6">
                  <div>
                    <p className="font-medium text-ink-100">Reveal time</p>
                    <p className="mt-0.5 text-sm text-ink-400">Move it earlier or later. Guests see the change right away.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label htmlFor="reveal-time" className="sr-only">Reveal time</label>
                    <input
                      id="reveal-time"
                      type="datetime-local"
                      value={newRevealTime}
                      onChange={(e) => setNewRevealTime(e.target.value)}
                      className="tabular h-10 flex-1 rounded-xl border border-white/10 bg-ink-950/70 px-3.5 font-mono text-sm text-ink-100 [color-scheme:dark] focus:border-flare-500/70 focus:ring-4 focus:ring-flare-500/15 focus:outline-none"
                    />
                    <Button onClick={handleRevealTimeUpdate}>Save time</Button>
                  </div>
                </div>

                <div className="space-y-3 p-6">
                  <div>
                    <p className="font-medium text-ink-100">Roll size</p>
                    <p className="mt-0.5 text-sm text-ink-400">Have a promo code? Apply it to add more shots.</p>
                  </div>
                  <div className="flex gap-2">
                    <label htmlFor="promo" className="sr-only">Promo code</label>
                    <input
                      id="promo"
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-950/70 px-3.5 font-mono text-sm tracking-[0.15em] text-ink-100 placeholder:tracking-normal placeholder:text-ink-500 focus:border-flare-500/70 focus:ring-4 focus:ring-flare-500/15 focus:outline-none"
                    />
                    <Button variant="secondary" onClick={handleApplyPromo}>Apply</Button>
                  </div>
                  {promoStatus && (
                    <p
                      role="status"
                      className={cn(
                        "text-sm",
                        promoStatus.startsWith('✓') ? 'text-[#7ee0ae]' : promoStatus.startsWith('✗') ? 'text-[#ff9ea1]' : 'text-ink-400'
                      )}
                    >
                      {promoStatus}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink-100">Download everything</p>
                    <p className="mt-0.5 text-sm text-ink-400">All photos and videos in one ZIP, numbered in order.</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className={cn(photosCount === 0 && "pointer-events-none opacity-45")}>
                    <a href={`/api/events/${id}/download`} download aria-disabled={photosCount === 0}>
                      <DownloadSimpleIcon /> Download ZIP
                    </a>
                  </Button>
                </div>
              </div>
            </section>

            <section className="surface">
              <div className="flex items-center justify-between gap-4 p-6">
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink-100">
                  Guests <span className="tabular text-ink-400">{participants.length}</span>
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)} aria-expanded={showParticipants}>
                  {showParticipants ? 'Hide' : 'Show list'}
                </Button>
              </div>
              {showParticipants && (
                <div className="border-t border-white/[0.06] p-3">
                  {participants.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-ink-400">No one has joined yet. Share the code to get started.</p>
                  ) : (
                    <ul className="custom-scrollbar max-h-[340px] space-y-1 overflow-y-auto">
                      {participants.map((p) => (
                        <li
                          key={p.id}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors",
                            p.status === 'active' ? 'hover:bg-white/[0.03]' : 'opacity-50'
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-ink-800 font-display text-sm font-semibold text-ink-200">
                              {p.name?.charAt(0)?.toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-ink-100">{p.name}</p>
                              <p className="text-xs text-ink-400">
                                Joined {new Date(p.created_at).toLocaleDateString()}
                                {p.status !== 'active' && <span className="ml-2 capitalize text-[#ff9ea1]">{p.status}</span>}
                              </p>
                            </div>
                          </div>
                          {p.status === 'active' && (
                            <div className="flex shrink-0 items-center gap-1">
                              <Button variant="ghost" size="xs" onClick={() => handleRemove(p.id)}>Remove</Button>
                              <Button variant="ghost" size="xs" className="text-[#ff9ea1] hover:bg-safelight/10 hover:text-[#ffb3b5]" onClick={() => handleKick(p.id)}>Kick</Button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>

            <section className="surface">
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink-100">Media</h2>
                  <p className="mt-0.5 text-sm text-ink-400">Only you can see these before the reveal.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    id="host-upload"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleHostUpload}
                  />
                  <Button variant="secondary" size="sm" onClick={() => document.getElementById('host-upload')?.click()}>
                    <UploadSimpleIcon /> Upload
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleOpenCamera}>
                    <CameraIcon /> Camera
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-expanded={showPreview}
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
                    {showPreview ? <EyeSlashIcon /> : <EyeIcon />}
                    {showPreview ? 'Hide' : `Preview (${photosCount})`}
                  </Button>
                </div>
              </div>

              {isUploading && (
                <div className="border-t border-white/[0.06] p-6" role="status" aria-live="polite">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-200">Uploading to the vault</span>
                    <span className="tabular font-mono text-flare-400">{uploadPct}%</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-950">
                    <div className="h-full rounded-full bg-flare-500 transition-[width] duration-300" style={{ width: `${uploadPct}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(uploadProgress).map(([name, progress]) => (
                      <span key={name} className="inline-flex items-center gap-1.5 rounded-lg bg-ink-800 px-2 py-1 text-xs text-ink-300">
                        <span className="max-w-[120px] truncate">{name}</span>
                        <span className="tabular font-mono text-flare-400">{progress}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showPreview && (
                <div className="border-t border-white/[0.06] p-4">
                  {photos.length === 0 ? (
                    <p className="py-10 text-center text-sm text-ink-400">Nothing on the roll yet.</p>
                  ) : (
                    <div className="custom-scrollbar max-h-[560px] overflow-y-auto pr-1">
                      <GalleryGrid
                        photos={photos}
                        isRevealing={false}
                        showDelete={true}
                        onDelete={handleDeleteMedia}
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" className="text-[#ff9ea1] hover:bg-safelight/10 hover:text-[#ffb3b5]" onClick={handleDelete}>
                <TrashIcon /> Delete this vault
              </Button>
            </div>
          </div>

          {/* Guest access, styled as a physical ticket with the join code */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="[perspective:1200px]">
              <div className="surface overflow-hidden transition-transform duration-500 ease-out-expo hover:[transform:rotateY(-6deg)_rotateX(4deg)]">
                <div className="p-6 text-center">
                  <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink-100">Guest access</h2>
                  <p className="mt-1 text-sm text-ink-400">Print it, project it, or send the link.</p>
                  <div className="mx-auto mt-6 w-fit rounded-2xl bg-ink-100 p-4 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.9)]">
                    <QRCodeSVG value={joinUrl} size={168} level="H" bgColor="#ededf0" fgColor="#0b0b0c" className="h-auto w-full max-w-[168px]" />
                  </div>
                </div>
                <div aria-hidden className="relative h-px border-t border-dashed border-white/15">
                  <span className="absolute -top-3 -left-3 size-6 rounded-full bg-ink-950" />
                  <span className="absolute -top-3 -right-3 size-6 rounded-full bg-ink-950" />
                </div>
                <div className="space-y-3 p-6">
                  <div className="text-center">
                    <p className="text-xs text-ink-400">Event code</p>
                    <p className="tabular mt-1 font-mono text-3xl font-semibold tracking-[0.2em] text-ink-100 select-all">{event.code}</p>
                  </div>
                  <Button onClick={copyJoinLink} size="lg" variant={copied ? "secondary" : "default"} className="w-full" aria-live="polite">
                    {copied ? <><CheckIcon weight="bold" className="text-developed" /> Link copied</> : <><CopyIcon /> Copy join link</>}
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href={`/${event.code}`} target="_blank">
                      Open guest view <ArrowUpRightIcon />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
