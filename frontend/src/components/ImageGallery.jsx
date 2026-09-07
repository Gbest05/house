import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

export default function ImageGallery({ images = [], title = "Property Image" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Fallback if no images provided
  const imgList = images.length > 0
    ? images.map(img => (typeof img === 'string' ? img : img.image_url))
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"];

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % imgList.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + imgList.length) % imgList.length);
  };

  return (
    <div className="space-y-3">
      {/* Main Image View */}
      <div 
        onClick={() => setLightboxOpen(true)}
        className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-900 cursor-pointer group shadow-sm"
      >
        <img
          src={imgList[activeIndex]}
          alt={`${title} - ${activeIndex + 1}`}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
        />

        {/* Counter Badge */}
        <div className="absolute bottom-4 left-4 bg-slate-950/70 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
          {activeIndex + 1} / {imgList.length} Photos
        </div>

        {/* Fullscreen Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          className="absolute bottom-4 right-4 bg-slate-950/70 hover:bg-slate-950 text-white p-2 rounded-full backdrop-blur-md transition"
          aria-label="View fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Prev / Next Controls on Main Image */}
        {imgList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Reel */}
      {imgList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {imgList.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                activeIndex === idx
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-between p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white py-2">
            <span className="text-sm font-medium text-slate-300">
              {title} ({activeIndex + 1} of {imgList.length})
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Middle Main Preview */}
          <div className="relative max-w-5xl max-h-[75vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={imgList[activeIndex]}
              alt={title}
              className="max-h-[75vh] max-w-full object-contain rounded-lg"
            />

            {imgList.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails */}
          <div className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto py-2" onClick={(e) => e.stopPropagation()}>
            {imgList.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition ${
                  activeIndex === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-50 hover:opacity-90'
                }`}
              >
                <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
