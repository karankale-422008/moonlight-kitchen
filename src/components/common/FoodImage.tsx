import React, { useState } from 'react';

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=75',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=75',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=75',
  'jumbo-sandwich': 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=400&q=75',
  'fries-bowl': 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=75',
  maggi: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=75',
  'cold-beverages': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=75',
  biryani: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=75',
  'special-combo': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=75',
  'pizza-combos': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=75',
  'burger-combos': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=75',
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=75';

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  className = '',
  category = 'pizza',
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const fallback = CATEGORY_FALLBACKS[category] || DEFAULT_FALLBACK;
      setImgSrc(fallback);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-800 ${className}`}>
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        </div>
      )}

      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
