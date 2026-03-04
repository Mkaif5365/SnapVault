"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Camera, RefreshCcw, Flashlight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { applyFilterToCanvas, FilterType, FILTERS } from "@/components/camera/CameraFilters"
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
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-500 animate-spin" />
      </div>
    )
  }

  const remaining = Math.max(0, event.photo_limit - photosCount)

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-between p-4 font-sans text-stone-100 overflow-hidden">
      {/* SVG Noise Filter Definition */}
      <svg className="hidden">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.6" 
            numOctaves="3" 
            stitchTiles="stitch"
          >
            <animate 
              attributeName="seed" 
              from="0" 
              to="100" 
              dur="10s" 
              repeatCount="indefinite" 
            />
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" operator="overlay" />
        </filter>
      </svg>
      {/* Header / StatusBar */}
      <div className="w-full max-w-md flex items-center justify-between px-2 pt-4">
        <button 
          onClick={() => {
            if (isHost && event?.id) {
              router.push(`/dashboard/events/${event.id}`)
            } else {
              router.push(`/${eventCode}`)
            }
          }}
          className="flex items-center gap-2 group text-stone-600 hover:text-stone-400"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-widest font-medium">
            {isHost ? 'Back to Dashboard' : 'Back to Hub'}
          </span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Event Vault</span>
          <span className="font-serif italic text-stone-100">#{eventCode}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-stone-500">Expiring</p>
          <p className="text-xs font-mono text-amber-500">
            {new Date(event.reveal_time).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main Disposable Body */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-stone-900 rounded-[2.5rem] p-4 shadow-2xl border-4 border-stone-800 flex flex-col items-center justify-center gap-6">
        {/* Shutter Texture / Lines */}
        <div className="absolute top-0 left-0 w-full h-12 bg-stone-800/30 rounded-t-[2.5rem] flex items-center justify-center">
          <div className="w-1/2 h-[1px] bg-stone-700"></div>
        </div>

        {/* Viewfinder */}
        <div className="relative w-full flex-1 bg-black rounded-3xl overflow-hidden border-2 border-stone-800 shadow-inner group">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover transition-all duration-500 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            style={{
              filter: filter === 'bw' ? 'grayscale(100%) contrast(1.2) brightness(0.9)' :
                      filter === 'sepia' ? 'sepia(0.8) contrast(1.1) brightness(0.95)' :
                      filter === 'polaroid' ? 'contrast(0.9) brightness(1.1) saturate(0.8)' :
                      filter === 'classic98' ? 'contrast(1.05) saturate(1.1) brightness(0.95)' :
                      'none'
            }}
          />
          
          {/* Grain Overlay (for B&W and Sepia) */}
          {(filter === 'bw' || filter === 'sepia') && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
              style={{ filter: 'url(#noiseFilter)' }}
            />
          )}

          {/* Real-time Date Stamp Overlay */}
          {(filter === 'classic98' || filter === 'polaroid') && (
            <div className="absolute bottom-4 right-4 pointer-events-none px-2 py-1">
               <p className="text-[#ff6600] font-mono font-bold text-lg drop-shadow-[0_2px_2px_rgba(255,102,0,0.5)]">
                 '26 {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }).replace('/', ' ')}
               </p>
            </div>
          )}

          {/* Flash Effect Layer */}
          <div className={`absolute inset-0 bg-white transition-opacity duration-150 pointer-events-none ${flash ? 'opacity-100' : 'opacity-0'}`} />

          {/* Loading Overlay */}
          {isCapturing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full border-t-2 border-amber-500 animate-spin mb-4" />
              <p className="text-amber-500 font-mono text-sm tracking-widest uppercase">Capturing...</p>
            </div>
          )}

          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono tracking-tighter">
            CAPACITY: <span className="text-amber-500">{photosCount.toString().padStart(2, '0')}</span> / {event.photo_limit}
          </div>

          {/* Video Timer */}
          {isRecording && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600/80 backdrop-blur-md px-3 py-1 rounded-full border border-red-500 shadow-lg animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-white font-mono text-sm font-bold">
                00:{recordingTime.toFixed(0).padStart(2, '0')} / 00:45
              </span>
            </div>
          )}

          {/* Mode Indicator */}
          {!isRecording && !previewUrl && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
              <button 
                onClick={() => setCaptureMode('photo')}
                className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                  captureMode === 'photo' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                }`}
              >
                Photo
              </button>
              <button 
                onClick={() => setCaptureMode('video')}
                className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                  captureMode === 'video' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                }`}
              >
                Video
              </button>
            </div>
          )}

          {/* Preview Overlay */}
          {previewUrl && (
            <div className="absolute inset-0 z-20 bg-black flex flex-col">
              <video 
                src={previewUrl} 
                autoPlay 
                loop 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-0 w-full flex justify-around px-6">
                <Button 
                  onClick={dismissPreview}
                  variant="outline" 
                  className="bg-stone-900/80 border-stone-700 text-white rounded-full px-8 backdrop-blur-md"
                >
                  Retake
                </Button>
                <Button 
                  onClick={uploadVideo}
                  disabled={isCapturing}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-full px-8 font-bold"
                >
                  {isCapturing ? <Loader2 className="animate-spin" /> : "Upload"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className="w-full grid grid-cols-3 items-center gap-4 px-4 pb-4">
          {/* Camera Switch */}
          <button 
            onClick={toggleCamera}
            className="w-12 h-12 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center hover:bg-stone-700 transition-colors mx-auto"
          >
            <RefreshCcw className="w-5 h-5 text-stone-400" />
          </button>

          {/* Shutter Button */}
          <button 
            onClick={handleCapture}
            disabled={isCapturing || remaining === 0 || previewUrl !== null}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 mx-auto ${
              remaining === 0 || previewUrl ? 'opacity-50 grayscale' : ''
            }`}
          >
            {/* Shutter Outer */}
            <div className="absolute inset-0 rounded-full bg-stone-700 border-4 border-stone-600 shadow-lg" />
            {/* Shutter Core */}
            <div className={`relative w-16 h-16 rounded-full border-4 border-stone-500 flex items-center justify-center transition-colors ${
              isRecording ? 'bg-red-600 animate-pulse' : isCapturing ? 'bg-amber-600' : 'bg-amber-500 hover:bg-amber-400'
            }`}>
              {isRecording ? (
                <div className="w-6 h-6 rounded-sm bg-white" />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-amber-600/50" />
              )}
            </div>
          </button>

          {/* Simulated Flash Toggle */}
          <button className="w-12 h-12 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center hover:bg-stone-700 transition-colors mx-auto group">
            <Flashlight className="w-5 h-5 text-stone-600 group-hover:text-amber-500" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-md bg-stone-900/50 backdrop-blur-md border border-stone-800 p-4 rounded-3xl flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 text-center">Media Filters</p>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as FilterType)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                filter === f.id 
                ? 'bg-amber-500 text-stone-950 shadow-lg' 
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden Canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      <footer className="w-full text-center pb-4">
        <p className="text-[9px] text-stone-700 tracking-[0.4em] uppercase font-mono">
          SnapVault Premium // V26-03
        </p>
      </footer>
    </div>
  )
}
