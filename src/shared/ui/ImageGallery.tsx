/**
 * MST ImageGallery Component - 2026 Edition
 * 
 * Galerie obrázků s lightboxem.
 */

import React, { useState, useCallback, useEffect } from 'react';

export interface GalleryImage {
  id: string;
  src: string;
  thumbnail?: string;
  alt?: string;
  caption?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  /** Počet sloupců */
  columns?: 2 | 3 | 4;
  /** Mezera mezi obrázky */
  gap?: 'sm' | 'md' | 'lg';
  /** Aspect ratio */
  aspectRatio?: 'square' | '4:3' | '16:9' | 'auto';
  /** Povolit lightbox */
  lightbox?: boolean;
  /** Rounded corners */
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
}

const gapStyles = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-4',
};

const aspectStyles = {
  square: 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  auto: '',
};

const roundedStyles = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
};

export function ImageGallery({
  images,
  columns = 3,
  gap = 'md',
  aspectRatio = 'square',
  lightbox = true,
  rounded = 'lg',
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    if (lightbox) {
      setSelectedIndex(index);
    }
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  }, [selectedIndex, images.length]);

  const goToNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  }, [selectedIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedIndex, goToPrev, goToNext]);

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };

  return (
    <>
      {/* Grid */}
      <div className={`grid ${gridCols[columns]} ${gapStyles[gap]}`}>
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => openLightbox(index)}
            className={`
              relative overflow-hidden
              ${aspectStyles[aspectRatio]}
              ${roundedStyles[rounded]}
              bg-slate-100 dark:bg-slate-800
              group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
            `}
          >
            <img
              src={image.thumbnail || image.src}
              alt={image.alt || ''}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Hover overlay */}
            {lightbox && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <ZoomIcon className="w-5 h-5 text-slate-700" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={selectedIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}
    </>
  );
}

// Lightbox component
interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 text-white">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Image container */}
        <div className="flex-1 flex items-center justify-center px-4 py-2">
          <img
            src={currentImage.src}
            alt={currentImage.alt || ''}
            className="max-w-full max-h-full object-contain animate-scale-in"
          />
        </div>

        {/* Caption */}
        {currentImage.caption && (
          <div className="px-4 py-3 text-center">
            <p className="text-white/80 text-sm">{currentImage.caption}</p>
          </div>
        )}

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 px-4 py-3 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => {
                  // We need to trigger the change through parent
                  const diff = index - currentIndex;
                  if (diff > 0) {
                    for (let i = 0; i < diff; i++) onNext();
                  } else if (diff < 0) {
                    for (let i = 0; i < Math.abs(diff); i++) onPrev();
                  }
                }}
                className={`
                  w-12 h-12 rounded-lg overflow-hidden flex-shrink-0
                  ${index === currentIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-80'}
                  transition-all duration-200
                `}
              >
                <img
                  src={img.thumbnail || img.src}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Single Image with zoom
 */
export interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsZoomed(true)}
        className={`relative group ${className}`}
      >
        <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ZoomIcon className="w-5 h-5 text-slate-700" />
          </div>
        </div>
      </button>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <CloseIcon className="w-6 h-6 text-white" />
          </button>
          <img
            src={src}
            alt={alt || ''}
            className="max-w-full max-h-full object-contain animate-scale-in"
          />
        </div>
      )}
    </>
  );
}

// Icons
function ZoomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 8v6M8 11h6" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default ImageGallery;
