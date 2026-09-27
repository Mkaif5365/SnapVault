"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

const FRAMES = [
  {
    src: "/shots/street-lights.jpg",
    alt: "String lights over a street at night",
    title: "Scan the code",
    body: "Guests open your vault from a QR code or link. No app, no account, just a name for their photos.",
  },
  {
    src: "/shots/film-camera.jpg",
    alt: "Hands holding a film camera",
    title: "Shoot the roll",
    body: "Each guest gets a limited roll with film looks and a date stamp. Photos and short videos both count.",
  },
  {
    src: "/shots/fireworks.jpg",
    alt: "Fireworks over the horizon at night",
    title: "Reveal together",
    body: "At the time you pick, the vault opens for everyone at once, like picking up prints from the lab.",
  },
]

/** A strip of film laid in perspective. Frames lift off the strip as it enters view. */
export function FilmStrip() {
  const reduce = useReducedMotion()

  return (
    <div className="[perspective:2000px]">
      <motion.div
        className="relative rounded-md bg-[#1a120c] px-3 py-7 shadow-[0_60px_80px_-40px_rgb(0_0_0/0.9)] [transform-style:preserve-3d] sm:px-5 sm:py-9"
        initial={reduce ? false : { rotateX: 38, rotateZ: -4, opacity: 0, y: 80 }}
        whileInView={{ rotateX: 18, rotateZ: -2, opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: "spring", stiffness: 40, damping: 16 }}
      >
        {/* Sprocket holes and edge print, like real 35mm stock */}
        <div aria-hidden className="sprockets absolute inset-x-3 top-2.5 h-2.5 opacity-90" />
        <div aria-hidden className="sprockets absolute inset-x-3 bottom-2.5 h-2.5 opacity-90" />
        <p aria-hidden className="absolute top-[18px] left-8 hidden font-mono text-[9px] tracking-[0.3em] text-flare-500/60 sm:block">
          SNAPVAULT 400
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FRAMES.map((f, i) => (
            <motion.article
              key={f.title}
              className="group relative overflow-hidden rounded-[3px] bg-ink-950 [transform-style:preserve-3d]"
              initial={reduce ? false : { z: 0 }}
              whileInView={{ z: 40 + i * 10 }}
              whileHover={reduce ? undefined : { z: 90 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.25 + i * 0.12 }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover opacity-90 transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
              </div>
              <div className="relative -mt-16 p-5">
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink-100">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{f.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
