import React from 'react';
import { Star, Clock, Truck, Sparkles, ChevronRight } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 border border-gray-800">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1400&q=80"
          alt="Moonlight Kitchen"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/98 via-gray-900/90 to-gray-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <div className="max-w-lg">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">Open Now · {RESTAURANT_CONFIG.operatingHours}</span>
          </div>

          {/* Brand Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-2">
            Moonlight
            <span className="block text-gradient">Kitchen</span>
          </h1>

          <p className="text-sm text-gray-300 font-medium mb-1">{RESTAURANT_CONFIG.tagline}</p>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6 max-w-md">
            Artisanal pizzas · Loaded sandwiches · Crispy fries · Double-masala Maggi ·
            Premium frappes · Royal dum biryani — delivered to your door.
          </p>

          {/* Info Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-white">4.4</span>
              <span className="text-gray-500">· 500+ orders</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>30–35 min delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              <Truck className="w-3.5 h-3.5 text-green-400" />
              <span>Free above ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</span>
            </div>
          </div>

          {/* Offers */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-200">Use <strong className="font-black text-amber-400">MOONLIGHT10</strong> → 10% off above ₹199</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm rounded-xl shadow-lg shadow-amber-900/30 transition-all active:scale-95 group"
          >
            Explore Menu
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
