"use client"

import Image from "next/image"
import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { FILTERS, FILTER_CSS, type FilterType } from "@/components/camera/CameraFilters"
import { cn } from "@/lib/utils"

/** One frame, five looks, fanned in 3D. The front card is the selected look. */
export function FilterDeck() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState<FilterType>("sepia")
  const order = FILTERS.map((f) => f.id as FilterType)
  const activeIndex = order.indexOf(active)

  return (
    <div className="flex h-full flex-col">
      <div className="relative grid min-h-[260px] flex-1 place-items-center [perspective:1200px] [transform-style:preserve-3d] sm:min-h-[320px]">
        {order.map((id, i) => {
          const offset = i - activeIndex
          const isActive = offset === 0
          return (
            <motion.button
              key={id}
              type="button"
              aria-label={`Preview ${FILTERS[i].name}`}
              onClick={() => setActive(id)}
              className="print col-start-1 row-start-1 w-[38%] max-w-[210px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-flare-500"
              style={{ zIndex: 10 - Math.abs(offset) }}
              animate={{
                x: `${offset * 44}%`,
                rotateY: offset * -16,
                rotateZ: offset * 3,
                z: isActive ? 60 : -Math.abs(offset) * 70,
                opacity: Math.abs(offset) > 2 ? 0 : 1,
              }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-ink-900">
                <Image
                  src="/shots/photographer.jpg"
                  alt=""
                  fill
                  sizes="210px"
                  className="object-cover"
                  style={{ filter: FILTER_CSS[id] }}
                />
                {(id === "classic98" || id === "polaroid") && (
                  <span className="stamp absolute right-[7%] bottom-[5%] text-[11px]">&apos;26 06 14</span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      <div role="tablist" aria-label="Film looks" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={active === f.id}
            onClick={() => setActive(f.id as FilterType)}
            className={cn(
              "h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-200",
              active === f.id
                ? "bg-ink-100 text-ink-950"
                : "bg-white/[0.04] text-ink-300 hover:bg-white/[0.08] hover:text-ink-100"
            )}
          >
            {f.name}
          </button>
        ))}
      </div>
    </div>
  )
}
