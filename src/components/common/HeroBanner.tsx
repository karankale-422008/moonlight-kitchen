import React from 'react';
import { Sparkles, Moon, Clock, Truck, ShieldCheck } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800 p-6 sm:p-10 mb-8 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl space-y-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
          <Moon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>ORIGINAL CLOUD KITCHEN MENU</span>
          <span className="opacity-40">•</span>
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>FRESH &amp; HOT</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif leading-tight">
          Good Food. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
            Bright Mood.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
          Welcome to <strong>Moonlight Kitchen</strong>. Enjoy stone-baked pizzas, loaded jumbo grill sandwiches, crispy oil-free fries, hot Maggi bowls, chilled frappes, and royal Hyderabadi dum biryanis delivered right to your doorstep.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Free Delivery above ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{RESTAURANT_CONFIG.operatingHours}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>WhatsApp Direct Kitchen Confirmation</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onExploreClick}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25"
          >
            Explore Today's Menu
          </button>
        </div>
      </div>
    </div>
  );
};
