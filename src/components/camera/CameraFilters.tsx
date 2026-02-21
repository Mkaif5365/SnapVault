"use client"

import React from 'react'

export type FilterType = 'none' | 'bw' | 'sepia' | 'polaroid' | 'classic98'

export const FILTERS = [
  { id: 'none', name: 'Raw' },
  { id: 'bw', name: 'Grainy B&W' },
  { id: 'sepia', name: 'Vintage Sepia' },
  { id: 'polaroid', name: 'Polaroid Soft' },
  { id: 'classic98', name: "'98 Date Stamp" },
]

export function applyFilterToCanvas(
  canvas: HTMLCanvasElement,
  filterType: FilterType
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  // 1. Apply Base CSS Filters
  ctx.save()
  
  if (filterType === 'bw') {
    ctx.filter = 'grayscale(100%) contrast(1.2) brightness(0.9)'
  } else if (filterType === 'sepia') {
    ctx.filter = 'sepia(0.8) contrast(1.1) brightness(0.95)'
  } else if (filterType === 'polaroid') {
    ctx.filter = 'contrast(0.9) brightness(1.1) saturate(0.8)'
  }

  // Redraw the image with the filter
  ctx.drawImage(canvas, 0, 0)
  ctx.restore()

  // 2. Add Grain (B&W and Sepia)
  if (filterType === 'bw' || filterType === 'sepia') {
    addGrain(ctx, width, height, filterType === 'bw' ? 0.1 : 0.05)
  }

  // 3. Add Date Stamp ('98 Date Stamp)
  if (filterType === 'classic98' || filterType === 'polaroid') {
    addDateStamp(ctx, width, height)
  }
}

function addGrain(ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 255 * intensity
    data[i] += grain
    data[i+1] += grain
    data[i+2] += grain
  }
  ctx.putImageData(imageData, 0, 0)
}

function addDateStamp(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const dateStr = `'${year} ${month} ${day}`

  ctx.font = `bold ${Math.floor(width * 0.05)}px "Courier New", Courier, monospace`
  ctx.fillStyle = '#ff6600' // Classic orange digital stamp
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  
  // Outer glow for the stamp
  ctx.shadowColor = 'rgba(255, 102, 0, 0.5)'
  ctx.shadowBlur = 5
  
  ctx.fillText(dateStr, width - 20, height - 20)
}
