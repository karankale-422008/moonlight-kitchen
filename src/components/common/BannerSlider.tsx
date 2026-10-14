import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { BannerItem } from '../../types/banner';

interface BannerSliderProps {
  banners: BannerItem[];
  onSelectCategory?: (category: string) => void;
  onExploreClick?: () => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  banners,
  onSelectCategory,
  onExploreClick,
}) => {
  const activeBanners = banners.filter(b => b.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeBanners.length, isPaused]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  };

  const handleActionClick = () => {
    if (currentBanner.categoryLink && onSelectCategory) {
      onSelectCategory(currentBanner.categoryLink);
    }
    if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-8 border border-gray-800 shadow-2xl group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Background Container */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-gray-950">
        {activeBanners.map((banner, index) => {
          const isCurrent = index === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image */}
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
                style={{ transform: isCurrent ? 'scale(1.08)' : 'scale(1)' }}
              />

              {/* Dark Luxury Vignette & Gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-black/30" />
            </div>
          );
        })}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-10 md:px-14 max-w-xl">
          {/* Tag / Badge */}
          {currentBanner.tag && (
            <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentBanner.tag}</span>
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-2 drop-shadow-md">
            {currentBanner.title}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed mb-6 max-w-md drop-shadow">
            {currentBanner.subtitle}
          </p>

          {/* Action CTA Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleActionClick}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-gray-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-900/40 transition-all uppercase tracking-wider"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Previous & Next Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all active:scale-90"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all active:scale-90"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Slide Pagination Dots / Progress Pills */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-7 h-2 bg-amber-400'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
