"use client"

import Image from "next/image"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"
import { LockIcon } from "@phosphor-icons/react"
import { pad, useCountdown, useDemoRevealTime } from "./useCountdown"

type Print = {
  src: string
  alt: string
  stamp: string
  left: string
  top: string
  width: string
  z: number
  rotate: number
}

// Prints tossed on a table, seen in perspective. Front-most print last.
const PRINTS: Print[] = [
  { src: "/shots/concert.jpg", alt: "Crowd with hands up in front of a lit stage", stamp: "'26 06 13", left: "-6%", top: "10%", width: "42%", z: -140, rotate: -13 },
  { src: "/shots/night-kiss.jpg", alt: "Couple kissing in the rain at night", stamp: "'26 06 13", left: "56%", top: "2%", width: "38%", z: -90, rotate: 9 },
  { src: "/shots/heart-hands.jpg", alt: "Two hands making a heart around the setting sun", stamp: "'26 06 14", left: "58%", top: "50%", width: "37%", z: 30, rotate: 6 },
  { src: "/shots/sparkler.jpg", alt: "Guest holding a lit sparkler", stamp: "'26 06 14", left: "4%", top: "52%", width: "36%", z: 50, rotate: -5 },
  { src: "/shots/wedding-van.jpg", alt: "Bride smiling inside a vintage van", stamp: "'26 06 14", left: "27%", top: "20%", width: "45%", z: 120, rotate: -2 },
]

export function HeroStage() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.6 })
  const rotateY = useTransform(sx, [-0.5, 0.5], [-24, -6])
  const rotateX = useTransform(sy, [-0.5, 0.5], [22, 8])

  const target = useDemoRevealTime()
  const left = useCountdown(target)

  return (
    <div
      className="relative mx-auto aspect-[1/1] w-full max-w-[640px] [perspective:1600px]"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      {/* Soft table light under the stack */}
      <div
        aria-hidden
        className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(236_106_46/0.22),transparent)] blur-2xl"
      />

      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={reduce ? { rotateX: 14, rotateY: -15 } : { rotateX, rotateY }}
      >
        {PRINTS.map((p, i) => (
          <motion.figure
            key={p.src}
            className="print absolute"
            style={{ left: p.left, top: p.top, width: p.width, z: p.z, rotateZ: p.rotate }}
            initial={reduce ? false : { opacity: 0, y: 60, rotateZ: p.rotate - 8 }}
            animate={{ opacity: 1, y: 0, rotateZ: p.rotate }}
            transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.15 + i * 0.12 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-ink-900">
              <motion.div
                className="absolute inset-0"
                initial={reduce ? false : { filter: "blur(14px) brightness(0.2) sepia(0.8)" }}
                animate={{ filter: "blur(0px) brightness(1) sepia(0)" }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.7 + i * 0.28 }}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 300px, 45vw"
                  className="object-cover"
                  priority
                />
              </motion.div>
              <span className="stamp absolute right-[6%] bottom-[5%] text-[clamp(9px,1.4vw,13px)]">{p.stamp}</span>
            </div>
          </motion.figure>
        ))}

        {/* Live countdown chip floating above the stack */}
        <motion.div
          className="glass absolute right-[-4%] bottom-[2%] flex items-center gap-3 rounded-full py-2 pr-4 pl-2"
          style={{ z: 200 }}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="grid size-8 place-items-center rounded-full bg-flare-500 text-ink-950">
            <LockIcon weight="bold" className="size-4" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] text-ink-400">Roll locked. Reveals in</span>
            <span className="tabular font-mono text-sm font-semibold text-ink-100">
              {left ? `${pad(left.hours + left.days * 24)}:${pad(left.minutes)}:${pad(left.seconds)}` : "--:--:--"}
            </span>
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}
