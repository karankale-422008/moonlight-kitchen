import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  };

  const handleBannerClick = () => {
    if (currentBanner.categoryLink && onSelectCategory) {
      onSelectCategory(currentBanner.categoryLink);
    }
    if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-8 border border-gray-800 shadow-2xl group select-none cursor-pointer bg-gray-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleBannerClick}
      title="Click banner to explore dishes in this category"
    >
      {/* Banner Display Container — Clean visual canvas with NO text overlay */}
      <div className="relative w-full aspect-[21/9] min-h-[180px] sm:min-h-[240px] md:min-h-[290px] max-h-[380px] overflow-hidden">
        {activeBanners.map((banner, index) => {
          const isCurrent = index === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          );
        })}

        {/* Previous & Next Navigation Arrows (Clean & Unobtrusive) */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Slide Pagination Progress Dots */}
        {activeBanners.length > 1 && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-6 h-1.5 bg-amber-400'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
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
