"use client"

import { useState, useEffect } from "react"
import { ArrowLeftIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/Logo"

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
  const cells = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ]

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden bg-[#0d0707] px-5 py-6">
      {/* Safelight: the only light in a darkroom */}
      <div aria-hidden className="animate-safelight pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[720px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(229_72_77/0.28),transparent)]" />

      <div className="relative flex w-full max-w-md items-center justify-between">
        {onBack ? (
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 text-[#d9b3b3] hover:bg-safelight/10 hover:text-ink-100">
            <ArrowLeftIcon />
            Back
          </Button>
        ) : <span />}
        <span className="inline-flex items-center gap-2 text-xs text-[#d9b3b3]">
          <span className="animate-safelight size-2 rounded-full bg-safelight shadow-[0_0_10px_rgb(229_72_77/0.8)]" />
          Developing
        </span>
      </div>

      <main className="relative my-auto w-full max-w-md py-12 text-center">
        <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-[-0.035em] break-words text-ink-100">{eventName}</h1>
        <p className="mt-3 text-[#c9a3a3]">Your roll is in the tray. Nobody can see it yet.</p>

        {/* Countdown panel, tilted toward the viewer */}
        <div className="mt-10 [perspective:1000px]">
          <div
            className="rounded-[24px] border border-safelight/15 bg-[#160b0b]/90 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_40px_60px_-30px_rgb(0_0_0/0.9)] [transform:rotateX(10deg)]"
            role="timer"
            aria-label="Time until reveal"
          >
            <p className="text-xs text-[#c9a3a3]">Reveals in</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {cells.map((item) => (
                <div key={item.label}>
                  <div className="rounded-xl bg-[#0d0707] py-4 shadow-[inset_0_2px_8px_rgb(0_0_0/0.7)] ring-1 ring-white/[0.04]">
                    <p className="tabular font-mono text-3xl font-semibold text-ink-100">
                      {item.value.toString().padStart(2, '0')}
                    </p>
                  </div>
                  <p className="mt-2 text-[11px] text-[#c9a3a3]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-left">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-[#c9a3a3]">Shots on the roll</span>
            <span className="tabular font-mono text-ink-100">{photosCount} / {photoLimit}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-safelight transition-[width] duration-1000" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#c9a3a3]">
            {photosCount === 0
              ? "No shots yet. Be the first."
              : photosCount >= photoLimit
                ? "The roll is full."
                : `${photoLimit - photosCount} shots left for everyone.`}
          </p>
        </div>
      </main>

      <Logo href={null} className="relative opacity-60" markClassName="size-6" />
    </div>
  )
}
