"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon, CameraRotateIcon, LightningIcon, SpinnerGapIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { applyFilterToCanvas, FilterType, FILTERS, FILTER_CSS } from "@/components/camera/CameraFilters"
import { uploadMediaToTelegram } from "@/lib/telegram/actions"

export default function CameraPage() {
  const { eventCode } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isHost = searchParams.get('host') === '1'
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)
  const [photosCount, setPhotosCount] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [flash, setFlash] = useState(false)
  const [filter, setFilter] = useState<FilterType>('none')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [perFileProgress, setPerFileProgress] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      // 1. Fetch Event & Photos Count
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('code', eventCode)
        .single()

      if (eventError || !eventData) {
        console.error(eventError)
        router.push('/')
        return
      }

      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventData.id)

      setEvent(eventData)
      setPhotosCount(count || 0)
      setLoading(false)

      // 2. Start Camera
      startCamera()
    }

    init()

    return () => {
      stopCamera()
    }
  }, [eventCode, facingMode])

  const startCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      })
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (err) {
      console.error("Camera Access Error:", err)
      alert("Please allow camera access to use the disposable camera.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const toggleCamera = () => {
    stopCamera()
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const toggleCaptureMode = () => {
    if (isRecording || isCapturing) return
    setCaptureMode(prev => prev === 'photo' ? 'video' : 'photo')
  }

  const startRecording = () => {
    if (!stream) return
    
    recordedChunksRef.current = []
    const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm'
    const recorder = new MediaRecorder(stream, { mimeType })
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType })
      setPreviewBlob(blob)
      setPreviewUrl(URL.createObjectURL(blob))
      setIsRecording(false)
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    setIsRecording(true)
    setRecordingTime(0)

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 44.9) { // 45s limit
          stopRecording()
          return 45
        }
        return prev + 0.1
      })
    }, 100)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const handleCapture = () => {
    if (captureMode === 'photo') {
      capturePhoto()
    } else {
      if (isRecording) {
        stopRecording()
      } else {
        startRecording()
      }
    }
  }

  const uploadVideo = async () => {
    if (!previewBlob || !event) return
    setIsCapturing(true)
    setPerFileProgress(0)
    
    const formData = new FormData()
    formData.append("file", previewBlob, "video.mp4")
    formData.append("eventId", event.id)
    const participantId = localStorage.getItem(`participant_${event.id}`)
    if (participantId) formData.append("participantId", participantId)
    if (isHost && !participantId) formData.append("photographerName", "Host")
    formData.append("mediaType", "video")
    formData.append("mimeType", previewBlob.type)
    formData.append("duration", recordingTime.toString())

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/api/upload")

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setPerFileProgress(Math.round((event.loaded / event.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText)
            if (response.success) {
              setPhotosCount(prev => prev + 1)
              dismissPreview()
              resolve(response)
            } else {
              reject(new Error(response.error || "Upload failed"))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
        xhr.onerror = () => reject(new Error("Network error"))
        xhr.send(formData)
      })
    } catch (err: any) {
      alert(err.message || "Video upload failed")
    }
    
    setIsCapturing(false)
    setPerFileProgress(0)
  }

  const dismissPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewBlob(null)
    setPreviewUrl(null)
  }

  const capturePhoto = async () => {
    if (isCapturing || !videoRef.current || !canvasRef.current || !event) return
    if (photosCount >= event.photo_limit) {
      alert("This vault is full! No more photos can be added.")
      return
    }

    setIsCapturing(true)
    setFlash(true)
    setTimeout(() => setFlash(false), 150)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Draw frame
      ctx.drawImage(video, 0, 0)
      
      // Apply Filter
      applyFilterToCanvas(canvas, filter)
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData()
          formData.append("file", blob, "capture.jpg")
          formData.append("eventId", event.id)
          
          const participantId = localStorage.getItem(`participant_${event.id}`)
          if (participantId) {
            formData.append("participantId", participantId)
          } else if (isHost) {
            formData.append("photographerName", "Host")
          }
          formData.append("mediaType", "photo")
          formData.append("mimeType", "image/jpeg")

          try {
            await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest()
              xhr.open("POST", "/api/upload")
              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  const response = JSON.parse(xhr.responseText)
                  if (response.success) {
                    setPhotosCount(prev => prev + 1)
                    resolve(response)
                  } else {
                    reject(new Error(response.error || "Upload failed"))
                  }
                } else {
                  reject(new Error(`Upload failed: ${xhr.status}`))
                }
              }
              xhr.onerror = () => reject(new Error("Network error"))
              xhr.send(formData)
            })
          } catch (err: any) {
            alert(err.message || "Upload failed")
          }
        }
        setIsCapturing(false)
      }, 'image/jpeg', 1.0)
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center" aria-busy="true">
        <div className="flex flex-col items-center gap-4">
          <SpinnerGapIcon className="size-7 animate-spin text-ink-400" />
          <p className="text-sm text-ink-400">Loading film</p>
        </div>
      </div>
    )
  }

  const remaining = Math.max(0, event.photo_limit - photosCount)
  const stampDate = `'26 ${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }).replace('/', ' ')}`

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between gap-4 overflow-hidden px-4 pt-4 pb-6">
      {/* SVG noise used by the grain looks */}
      <svg className="hidden" aria-hidden>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch">
            <animate attributeName="seed" from="0" to="100" dur="10s" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" operator="overlay" />
        </filter>
      </svg>

      {/* Top bar */}
      <div className="flex w-full max-w-md items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isHost && event?.id) {
              router.push(`/dashboard/events/${event.id}`)
            } else {
              router.push(`/${eventCode}`)
            }
          }}
          className="-ml-2"
        >
          <ArrowLeftIcon />
          {isHost ? 'Dashboard' : 'Back'}
        </Button>
        <div className="text-center">
          <p className="max-w-[160px] truncate text-sm font-medium text-ink-100">{event.name}</p>
          <p className="tabular font-mono text-[11px] text-ink-400">#{eventCode}</p>
        </div>
        <div className="text-right">
          <p className="tabular font-mono text-sm font-semibold text-ink-100">{remaining}</p>
          <p className="text-[11px] text-ink-400">shots left</p>
        </div>
      </div>

      {/* Camera body */}
      <div className="relative w-full max-w-sm rounded-[40px] bg-gradient-to-b from-ink-800 to-ink-900 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-2px_0_rgb(0_0_0/0.4),0_40px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/[0.06]">
        {/* Viewfinder */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[30px] bg-ink-950 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`h-full w-full object-cover transition-[filter] duration-500 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            style={{ filter: FILTER_CSS[filter] }}
          />

          {(filter === 'bw' || filter === 'sepia') && (
            <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay" style={{ filter: 'url(#noiseFilter)' }} />
          )}

          {(filter === 'classic98' || filter === 'polaroid') && (
            <p className="stamp pointer-events-none absolute right-5 bottom-16 text-lg">{stampDate}</p>
          )}

          <div className={`pointer-events-none absolute inset-0 bg-ink-100 transition-opacity duration-150 ${flash ? 'opacity-100' : 'opacity-0'}`} />

          {isCapturing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-950/60 backdrop-blur-sm" role="status">
              <SpinnerGapIcon className="size-8 animate-spin text-flare-400" />
              <p className="text-sm text-ink-100">
                {captureMode === 'video' && perFileProgress > 0 ? `Sending to the vault ${perFileProgress}%` : 'Saving to the vault'}
              </p>
            </div>
          )}

          <div className="glass absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs text-ink-200">
            <span className="tabular text-flare-400">{photosCount.toString().padStart(2, '0')}</span>
            <span className="text-ink-400">/ {event.photo_limit}</span>
          </div>

          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-safelight/90 px-3 py-1 shadow-lg">
              <span className="size-2 animate-pulse rounded-full bg-ink-100" />
              <span className="tabular font-mono text-xs font-semibold text-ink-100">
                00:{recordingTime.toFixed(0).padStart(2, '0')} / 00:45
              </span>
            </div>
          )}

          {!isRecording && !previewUrl && (
            <div role="radiogroup" aria-label="Capture mode" className="glass absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-full p-1">
              {(['photo', 'video'] as const).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={captureMode === m}
                  onClick={() => setCaptureMode(m)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    captureMode === m ? 'bg-ink-100 text-ink-950' : 'text-ink-300 hover:text-ink-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {previewUrl && (
            <div className="absolute inset-0 z-20 flex flex-col bg-ink-950">
              <video src={previewUrl} autoPlay loop playsInline className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-5 flex justify-center gap-3 px-5">
                <Button onClick={dismissPreview} variant="secondary" size="lg" className="flex-1">
                  Retake
                </Button>
                <Button onClick={uploadVideo} disabled={isCapturing} size="lg" className="flex-1">
                  {isCapturing ? <SpinnerGapIcon className="animate-spin" /> : "Keep it"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 items-center px-4 pt-5 pb-3">
          <button
            onClick={toggleCamera}
            aria-label="Switch camera"
            className="mx-auto grid size-12 place-items-center rounded-full bg-ink-700 text-ink-200 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] transition-colors hover:bg-ink-600 active:scale-95"
          >
            <CameraRotateIcon className="size-5" />
          </button>

          <button
            onClick={handleCapture}
            disabled={isCapturing || remaining === 0 || previewUrl !== null}
            aria-label={captureMode === 'photo' ? 'Take photo' : isRecording ? 'Stop recording' : 'Start recording'}
            className="group relative mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-b from-ink-600 to-ink-800 shadow-[0_8px_20px_-6px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.12)] transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <span
              className={`grid size-[62px] place-items-center rounded-full shadow-[inset_0_-3px_6px_rgb(0_0_0/0.25),inset_0_2px_0_rgb(255_255_255/0.35)] transition-colors ${
                isRecording ? 'animate-pulse bg-safelight' : isCapturing ? 'bg-flare-600' : captureMode === 'video' ? 'bg-safelight group-hover:bg-[#f06065]' : 'bg-flare-500 group-hover:bg-flare-400'
              }`}
            >
              {isRecording && <span className="size-5 rounded-[5px] bg-ink-100" />}
            </span>
          </button>

          <button
            aria-label="Flash (decorative)"
            className="group mx-auto grid size-12 place-items-center rounded-full bg-ink-700 text-ink-400 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] transition-colors hover:bg-ink-600"
          >
            <LightningIcon className="size-5 group-hover:text-flare-400" />
          </button>
        </div>
      </div>

      {/* Film looks */}
      <div className="w-full max-w-md">
        <p className="mb-2 text-center text-xs text-ink-400">Film look</p>
        <div role="radiogroup" aria-label="Film look" className="scrollbar-hide flex gap-2 overflow-x-auto px-1 pb-1 sm:justify-center">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="radio"
              aria-checked={filter === f.id}
              onClick={() => setFilter(f.id as FilterType)}
              className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors ${
                filter === f.id
                  ? 'bg-ink-100 text-ink-950'
                  : 'bg-white/[0.05] text-ink-300 hover:bg-white/[0.09] hover:text-ink-100'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
