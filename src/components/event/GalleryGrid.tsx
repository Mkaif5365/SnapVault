"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight, Play, Video as VideoIcon, ImageIcon, Download } from "lucide-react"

interface Photo {
  id: string
  telegram_file_id: string
  created_at: string
  photographer_name?: string
  media_type?: 'photo' | 'video'
  mime_type?: string
}

interface GalleryGridProps {
  photos: Photo[]
  isRevealing: boolean
  showPhotographer?: boolean
}

export default function GalleryGrid({ photos, isRevealing, showPhotographer = true }: GalleryGridProps) {
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
            {photo.media_type === 'video' ? (
              <div className="relative w-full h-full bg-stone-900 flex items-center justify-center">
                <video
                  src={`/api/photos/${photo.telegram_file_id}#t=0.1`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={`/api/photos/${photo.telegram_file_id}`}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            )}
            
            {/* Photographer Name Overlay */}
            {showPhotographer && photo.photographer_name && (
              <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-[7px] text-stone-100 font-medium px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {photo.photographer_name}
              </div>
            )}
            
            {/* Media Type Badge */}
            <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md p-1 rounded shadow-sm">
              {photo.media_type === 'video' ? (
                <VideoIcon className="w-3 h-3 text-amber-500" />
              ) : (
                <ImageIcon className="w-3 h-3 text-stone-300" />
              )}
            </div>

            <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm text-[8px] text-stone-300 font-mono px-1.5 py-0.5 rounded">
              {photo.media_type === 'video' ? 'Video' : 'Image'} #{(index + 1).toString().padStart(2, '0')}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <a
              href={`/api/photos/${photos[lightboxIndex].telegram_file_id}?download=1`}
              className="p-2 text-stone-400 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Download Media"
            >
              <Download className="w-6 h-6" />
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox() }}
              className="p-2 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

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

          <div className="max-w-4xl max-h-[90vh] p-4 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {photos[lightboxIndex].media_type === 'video' ? (
              <video
                src={`/api/photos/${photos[lightboxIndex].telegram_file_id}`}
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-white/10"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={`/api/photos/${photos[lightboxIndex].telegram_file_id}`}
                alt={`Photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            )}
            <p className="text-center text-stone-500 text-xs font-mono mt-3">
              {photos[lightboxIndex].media_type === 'video' ? 'Video' : 'Image'} #{(lightboxIndex + 1).toString().padStart(2, '0')} of {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
