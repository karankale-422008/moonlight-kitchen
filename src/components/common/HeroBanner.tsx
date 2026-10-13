import React from 'react';
import { Star, Clock, Truck, Phone, Sparkles, MapPin } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs mb-8 overflow-hidden relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Information */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-current text-emerald-600" />
              <span>4.4 (500+ happy orders)</span>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">Cloud Kitchen &amp; Fast Delivery</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif">
            Moonlight <span className="text-orange-600">Kitchen</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Freshly prepared artisanal pizzas, jumbo loaded grilled sandwiches, crispy oil-free fries, double-masala Maggi, chilled frappes &amp; shakes, and royal Hyderabadi dum biryani.
          </p>

          {/* Key Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span>30-35 mins</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free Delivery &gt;₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Phone className="w-3.5 h-3.5 text-slate-700" />
              <span>{RESTAURANT_CONFIG.displayPhone}</span>
            </div>
          </div>
        </div>

        {/* Right Deal Card */}
        <div className="w-full md:w-auto bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/80 rounded-2xl p-5 md:min-w-[280px] space-y-3">
          <div className="flex items-center gap-2 text-orange-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Today's Kitchen Offers</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0" />
              <span className="text-slate-800">
                Use code <strong>MOONLIGHT10</strong> for 10% off above ₹199
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span className="text-slate-800">
                <strong>FREE Home Delivery</strong> on all orders above ₹299
              </span>
            </div>
          </div>

          <button
            onClick={onExploreClick}
            className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Order Now &darr;
          </button>
        </div>
      </div>
    </div>
  );
};
