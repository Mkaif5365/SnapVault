"use client"

import { useState, useEffect, useRef } from "react"
import { CaretLeftIcon, CaretRightIcon, DownloadSimpleIcon, PlayIcon, TrashIcon, VideoCameraIcon, XIcon } from "@phosphor-icons/react"

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
      <div className="surface py-20 text-center">
        <p className="font-display text-xl font-semibold text-ink-100">The roll came back empty.</p>
        <p className="mt-2 text-sm text-ink-400">No photos were taken in this vault.</p>
      </div>
    )
  }

  return (
    <>
      {/* Gallery Grid */}
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
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
          role="dialog" aria-modal="true" aria-label="Media viewer" className="fixed inset-0 z-50 flex touch-none items-center justify-center backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            backgroundColor: `rgba(11, 11, 12, ${Math.max(0.7, 0.95 - translateY / 1000)})`
          }}
        >
          <div 
            className="absolute top-4 right-4 z-50 flex items-center gap-1.5"
            style={{ opacity: Math.max(0, 1 - translateY / 100) }}
          >
            {showDelete && onDelete && (
              <button
                onClick={(e) => { 
                  e.stopPropagation()
                  if (lightboxIndex !== null) {
                    onDelete(photos[lightboxIndex].id)
                    closeLightbox()
                  }
                }}
                className="grid size-11 place-items-center rounded-full bg-safelight/15 text-[#ff9ea1] transition-colors hover:bg-safelight/25"
                title="Delete media"
                aria-label="Delete media"
              >
                <TrashIcon className="size-5" />
              </button>
            )}
            <a
              href={`/api/photos/${photos[lightboxIndex].telegram_file_id}?download=1`}
              className="grid size-11 place-items-center rounded-full bg-white/[0.08] text-ink-100 transition-colors hover:bg-white/[0.14]"
              onClick={(e) => e.stopPropagation()}
              title="Download"
              aria-label="Download"
            >
              <DownloadSimpleIcon className="size-5" />
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox() }}
              className="grid size-11 place-items-center rounded-full bg-white/[0.08] text-ink-100 transition-colors hover:bg-white/[0.14]"
              aria-label="Close"
            >
              <XIcon className="size-5" />
            </button>
          </div>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute top-1/2 left-4 z-50 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/[0.08] text-ink-100 transition-colors hover:bg-white/[0.14] sm:grid"
              aria-label="Previous"
            >
              <CaretLeftIcon className="size-6" />
            </button>
          )}

          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute top-1/2 right-4 z-50 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/[0.08] text-ink-100 transition-colors hover:bg-white/[0.14] sm:grid"
              aria-label="Next"
            >
              <CaretRightIcon className="size-6" />
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
                className="max-h-[80vh] max-w-full rounded-[14px] shadow-2xl ring-1 ring-white/10"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={`/api/photos/${photos[lightboxIndex].telegram_file_id}`}
                alt={`Photo ${lightboxIndex + 1}`}
                className="max-h-[85vh] max-w-full rounded-[14px] object-contain shadow-2xl"
              />
            )}
            <p className="tabular mt-3 text-center font-mono text-xs text-ink-400">
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
      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-[14px] bg-ink-900 ring-1 ring-white/[0.06] transition-[box-shadow] duration-300 outline-none hover:ring-white/15 focus-visible:ring-2 focus-visible:ring-flare-500 ${
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
                className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink-950/20 transition-colors group-hover:bg-ink-950/40">
                <div className="glass grid size-11 place-items-center rounded-full">
                  <PlayIcon weight="fill" className="ml-0.5 size-5 text-ink-100" />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={`/api/photos/${photo.telegram_file_id}`}
              alt={`Photo ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
              loading="lazy"
            />
          )}
          
          {/* Photographer Name Overlay */}
          {showPhotographer && photo.photographer_name && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent px-2.5 pt-6 pb-2 text-left text-[11px] font-medium text-ink-100 opacity-0 transition-opacity group-hover:opacity-100">
              {photo.photographer_name}
            </div>
          )}

          {/* Delete Button (Host Only) */}
          {showDelete && onDelete && (
            <div 
              onClick={(e) => { e.stopPropagation(); onDelete(photo.id) }}
              className="absolute right-2 bottom-2 z-10 grid size-8 cursor-pointer place-items-center rounded-full bg-safelight/90 text-ink-100 opacity-0 shadow-lg transition-[opacity,transform] group-hover:opacity-100 hover:scale-105 active:scale-95"
              title="Delete media"
            >
              <TrashIcon className="size-4" />
            </div>
          )}
          
          {/* Download Shortcut (Desktop) */}
          <a
            href={`/api/photos/${photo.telegram_file_id}?download=1`}
            className="glass absolute top-2 right-2 z-10 hidden size-8 place-items-center rounded-full text-ink-100 opacity-0 transition-opacity group-hover:opacity-100 sm:grid"
            onClick={(e) => e.stopPropagation()}
            title="Download original"
          >
            <DownloadSimpleIcon className="size-4" />
          </a>

          {/* Video marker only; photos need no label */}
          {photo.media_type === 'video' && (
            <span className="glass absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-ink-100">
              <VideoCameraIcon weight="fill" className="size-3 text-flare-400" /> Video
            </span>
          )}
        </>
      ) : (
        <div className="h-full w-full animate-pulse bg-ink-800/60" />
      )}
    </button>
  )
}
