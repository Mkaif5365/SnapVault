"use client"

import Image from "next/image"
import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"

const SHOTS = [
  { src: "/shots/golden-hour.jpg", alt: "Woman in golden evening light", className: "md:col-span-2 md:row-span-2" },
  { src: "/shots/stage-lights.jpg", alt: "Stage lights over a dancing crowd", className: "md:col-span-2" },
  { src: "/shots/sparkler-close.jpg", alt: "Close-up of a burning sparkler", className: "" },
  { src: "/shots/photographer.jpg", alt: "Guest taking a photo with a compact camera", className: "md:row-span-2" },
  { src: "/shots/concert.jpg", alt: "Hands raised at a concert", className: "md:col-span-2" },
  { src: "/shots/night-kiss.jpg", alt: "Couple kissing at night", className: "md:col-span-2" },
  { src: "/shots/wedding-van.jpg", alt: "Bride in a vintage van", className: "hidden md:block md:col-span-2" },
]

/**
 * Scroll-linked developing tray: every photo starts as an underexposed, blurred
 * latent image and resolves as the section scrolls through. Tells the product's
 * core moment (the simultaneous reveal) without words.
 */
export function DevelopReel() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] })

  return (
    <div ref={ref} className="grid auto-rows-[150px] grid-cols-2 gap-2 sm:auto-rows-[190px] sm:gap-3 md:grid-flow-dense md:grid-cols-5 md:auto-rows-[170px] lg:auto-rows-[200px]">
      {SHOTS.map((s, i) => (
        <Tile key={s.src + i} {...s} index={i} progress={scrollYProgress} still={!!reduce} />
      ))}
    </div>
  )
}

function Tile({
  src,
  alt,
  className,
  index,
  progress,
  still,
}: {
  src: string
  alt: string
  className: string
  index: number
  progress: MotionValue<number>
  still: boolean
}) {
  const start = 0.15 + index * 0.07
  const end = start + 0.45
  const blur = useTransform(progress, [start, end], [18, 0], { clamp: true })
  const bright = useTransform(progress, [start, end], [0.18, 1], { clamp: true })
  const sepia = useTransform(progress, [start, end], [0.9, 0], { clamp: true })
  const filter = useTransform(
    [blur, bright, sepia] as MotionValue<number>[],
    ([b, br, s]) => `blur(${b}px) brightness(${br}) sepia(${s})`
  )
  const scale = useTransform(progress, [start, end], [1.08, 1], { clamp: true })

  return (
    <div className={`relative overflow-hidden rounded-[14px] bg-ink-900 ${className}`}>
      <motion.div className="absolute inset-0" style={still ? undefined : { filter, scale }}>
        <Image src={src} alt={alt} fill sizes="(min-width: 768px) 40vw, 66vw" className="object-cover" />
      </motion.div>
    </div>
  )
}
