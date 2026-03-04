"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight, Play, Video as VideoIcon, ImageIcon, Download, Trash } from "lucide-react"

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
  onDelete?: (photoId: string) => void
  showDelete?: boolean
}

export default function GalleryGrid({ photos, isRevealing, showPhotographer = true, onDelete, showDelete = false }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [translateY, setTranslateY] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY)
    setTranslateY(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const currentY = e.targetTouches[0].clientY
    const deltaY = currentY - touchStart
    if (deltaY > 0) {
      setTranslateY(deltaY)
      setTouchEnd(currentY)
    }
  }

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      setTranslateY(0)
      return
    }
    const distance = touchEnd - touchStart
    const isSwipeDown = distance > 100
    if (isSwipeDown) {
      closeLightbox()
    }
    setTranslateY(0)
    setTouchStart(null)
    setTouchEnd(null)
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setTranslateY(0)
  }
  const closeLightbox = () => {
    setLightboxIndex(null)
    setTranslateY(0)
  }
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
        <GalleryItem 
          key={photo.id} 
          photo={photo} 
          index={index} 
          isRevealing={isRevealing} 
          showPhotographer={showPhotographer}
          showDelete={showDelete}
          onDelete={onDelete}
          onClick={() => openLightbox(index)}
        />
      ))}
    </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-300 touch-none" 
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            backgroundColor: `rgba(0, 0, 0, ${Math.max(0.7, 0.95 - translateY / 1000)})`
          }}
        >
          <div 
            className="absolute top-4 right-4 z-50 flex items-center gap-2"
            style={{ opacity: Math.max(0, 1 - translateY / 100) }}
          >
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

          <div 
            className="max-w-4xl max-h-[90vh] p-4 flex flex-col items-center transition-transform duration-200" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              transform: `translateY(${translateY}px)`,
            }}
          >
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

function GalleryItem({ photo, index, isRevealing, showPhotographer, showDelete, onDelete, onClick }: { 
  photo: Photo, index: number, isRevealing: boolean, showPhotographer: boolean, showDelete: boolean, onDelete?: (id: string) => void, onClick: () => void 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const itemRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    )

    if (itemRef.current) observer.observe(itemRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <button
      ref={itemRef}
      onClick={onClick}
      className={`relative aspect-square overflow-hidden rounded-lg border border-stone-800/50 bg-stone-900 group cursor-pointer transition-all duration-700 ${
        isRevealing ? 'animate-reveal' : isVisible ? 'animate-in fade-in slide-in-from-bottom-2 duration-1000 fill-mode-both' : 'opacity-0'
      }`}
      style={{
        animationDelay: isRevealing ? `${index * 100}ms` : '0ms',
      }}
    >
      {isVisible ? (
        <>
          {photo.media_type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center">
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
            <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-md text-[8px] text-white font-semibold px-2 py-0.5 rounded shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              {photo.photographer_name}
            </div>
          )}

          {/* Delete Button (Host Only) */}
          {showDelete && onDelete && (
            <div 
              onClick={(e) => { e.stopPropagation(); onDelete(photo.id) }}
              className="absolute top-1.5 left-1.5 z-10 bg-red-500/90 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-red-400/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 active:scale-95 cursor-pointer"
              title="Delete Media"
            >
              <Trash className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          
          {/* Download Shortcut (Desktop) */}
          <a
            href={`/api/photos/${photo.telegram_file_id}?download=1`}
            className="absolute bottom-1.5 left-1.5 bg-white/20 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90 hidden sm:flex"
            onClick={(e) => e.stopPropagation()}
            title="Download Original"
          >
            <Download className="w-3.5 h-3.5 text-white" />
          </a>

          {/* Media Type Badge */}
          <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-white/10 flex items-center gap-1.5">
            {photo.media_type === 'video' ? (
              <>
                <VideoIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[7px] font-bold text-amber-400 uppercase tracking-tighter">Video</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-stone-300" />
                <span className="text-[7px] font-bold text-stone-300 uppercase tracking-tighter">Photo</span>
              </>
            )}
          </div>

          <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-[8px] text-stone-200 font-mono px-2 py-0.5 rounded border border-white/5 shadow-sm">
            #{(index + 1).toString().padStart(2, '0')}
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-stone-900/50 animate-pulse" />
      )}
    </button>
  )
}
