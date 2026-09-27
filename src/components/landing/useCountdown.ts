"use client"

import { useEffect, useState } from "react"

export type Countdown = { days: number; hours: number; minutes: number; seconds: number; done: boolean }

const EMPTY: Countdown = { days: 0, hours: 0, minutes: 0, seconds: 0, done: false }

function diff(target: number): Countdown {
  const ms = target - Date.now()
  if (ms <= 0) return { ...EMPTY, done: true }
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
    done: false,
  }
}

/** Ticks once per second. Returns null until mounted so SSR and client markup match. */
export function useCountdown(target: number | null) {
  const [value, setValue] = useState<Countdown | null>(null)

  useEffect(() => {
    if (target === null) return
    setValue(diff(target))
    const id = setInterval(() => setValue(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return value
}

/** A demo reveal time for marketing previews: the next 23:00 local time. */
export function useDemoRevealTime() {
  const [target, setTarget] = useState<number | null>(null)
  useEffect(() => {
    const d = new Date()
    d.setHours(23, 0, 0, 0)
    if (d.getTime() - Date.now() < 60 * 60 * 1000) d.setDate(d.getDate() + 1)
    setTarget(d.getTime())
  }, [])
  return target
}

export const pad = (n: number) => n.toString().padStart(2, "0")
