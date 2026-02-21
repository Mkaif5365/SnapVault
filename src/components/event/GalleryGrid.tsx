"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface Photo {
  id: string
  telegram_file_id: string
  created_at: string
}

interface GalleryGridProps {
  photos: Photo[]
  isRevealing: boolean
}

export default function GalleryGrid({ photos, isRevealing }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const goNext = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
  }
  const goPrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 font-serif italic text-lg">No photos were captured for this vault.</p>
      </div>
    )
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(index)}
            className={`relative aspect-square overflow-hidden rounded-lg border border-stone-200 group cursor-pointer transition-all duration-1000 ${
              isRevealing ? 'animate-reveal' : ''
            }`}
            style={{
              animationDelay: isRevealing ? `${index * 100}ms` : '0ms',
            }}
          >
            <img
              src={`/api/photos/${photo.telegram_file_id}`}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Frame Number */}
            <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm text-[8px] text-stone-300 font-mono px-1.5 py-0.5 rounded">
              #{(index + 1).toString().padStart(2, '0')}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox() }}
            className="absolute top-4 right-4 z-50 p-2 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 text-stone-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 text-stone-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}

          <div className="max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={`/api/photos/${photos[lightboxIndex].telegram_file_id}`}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-center text-stone-500 text-xs font-mono mt-3">
              Frame #{(lightboxIndex + 1).toString().padStart(2, '0')} of {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
