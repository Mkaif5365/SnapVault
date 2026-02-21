"use client"

import { useState, useEffect } from "react"
import { Camera, ArrowLeft } from "lucide-react"

interface DevelopingScreenProps {
  eventName: string
  revealTime: string
  photosCount: number
  photoLimit: number
  onBack?: () => void
}

export default function DevelopingScreen({ eventName, revealTime, photosCount, photoLimit, onBack }: DevelopingScreenProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(revealTime).getTime()
      const diff = target - now

      if (diff <= 0) {
        setIsExpired(true)
        clearInterval(interval)
        // Auto-reload to trigger the reveal
        window.location.reload()
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [revealTime])

  const progress = photoLimit > 0 ? (photosCount / photoLimit) * 100 : 0

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Back to Hub Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-1.5 p-2 text-stone-600 hover:text-stone-300 transition-colors group z-[100]"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-widest font-medium">Back to Hub</span>
        </button>
      )}

      {/* Pulsating Red Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-red-900/20 animate-pulse blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-red-800/30 animate-pulse blur-xl pointer-events-none" style={{ animationDelay: '0.5s' }} />
      
      {/* Small Red Indicator Light */}
      <div className="absolute top-8 right-8">
        <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.6)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-10 max-w-md w-full">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-stone-900 border-2 border-stone-800 flex items-center justify-center shadow-2xl">
          <Camera className="w-10 h-10 text-red-500/70" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-red-500/60 font-mono">Vault Status</p>
          <h1 className="text-4xl font-serif italic text-stone-200">{eventName}</h1>
          <p className="text-stone-600 text-sm">Your images are currently hidden...</p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-4 font-mono">Revealing In</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Min' },
              { value: timeLeft.seconds, label: 'Sec' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="bg-stone-900 border border-stone-800 rounded-xl py-3 px-2 shadow-inner">
                  <p className="text-3xl font-mono font-bold text-stone-100 tabular-nums">
                    {item.value.toString().padStart(2, '0')}
                  </p>
                </div>
                <p className="text-[9px] uppercase tracking-widest text-stone-600 mt-2 font-mono">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Roll Progress */}
        <div className="bg-stone-900/30 border border-stone-800/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-500 uppercase tracking-wider">Vault Progress</span>
            <span className="text-red-500/80">{photosCount} / {photoLimit}</span>
          </div>
          <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-red-900 to-red-600 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="text-stone-700 text-[10px] italic text-center">
            {photosCount === 0 
              ? "No images captured yet." 
              : photosCount >= photoLimit 
                ? "Vault is full!" 
                : `${photoLimit - photosCount} slots remaining.`}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center">
        <p className="text-[9px] text-stone-800 tracking-[0.4em] uppercase font-mono">
          SnapVault // Premium
        </p>
      </footer>
    </div>
  )
}
