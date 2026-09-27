"use client"

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { pad, useCountdown, useDemoRevealTime } from "./useCountdown"

export function VaultTimer() {
  const target = useDemoRevealTime()
  const left = useCountdown(target)
  const cells = [
    { label: "Hours", value: left ? pad(left.hours + left.days * 24) : "--" },
    { label: "Min", value: left ? pad(left.minutes) : "--" },
    { label: "Sec", value: left ? pad(left.seconds) : "--" },
  ]

  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Example reveal countdown">
      {cells.map((c) => (
        <div key={c.label} className="rounded-xl border border-white/[0.06] bg-ink-950/80 px-2 py-3 text-center shadow-[inset_0_2px_6px_rgb(0_0_0/0.5)]">
          <p className="tabular font-mono text-[28px] leading-none font-semibold text-ink-100">{c.value}</p>
          <p className="mt-2 text-[11px] text-ink-400">{c.label}</p>
        </div>
      ))}
    </div>
  )
}

export function JoinQR() {
  const [url, setUrl] = useState("https://snapvault.app")
  useEffect(() => setUrl(`${window.location.origin}/register`), [])
  return (
    <div className="rounded-2xl bg-ink-100 p-3 shadow-[0_20px_40px_-18px_rgb(0_0_0/0.9)]">
      <QRCodeSVG value={url} size={112} level="M" bgColor="#ededf0" fgColor="#0b0b0c" />
    </div>
  )
}
