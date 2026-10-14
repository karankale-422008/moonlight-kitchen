import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant';

import { RestaurantSettings } from '../../types/settings';

interface FooterProps {
  onOpenAdmin?: () => void;
  settings?: RestaurantSettings;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, settings }) => {
  const storeName = settings?.name || RESTAURANT_CONFIG.name;
  const storeTagline = settings?.tagline || RESTAURANT_CONFIG.tagline;
  const storePhone = settings?.contactPhone || RESTAURANT_CONFIG.displayPhone;
  const storeHours = settings?.operatingHours || RESTAURANT_CONFIG.operatingHours;
  const storeCity = settings?.city || RESTAURANT_CONFIG.city;
  const freeThreshold = settings?.freeDeliveryThreshold || RESTAURANT_CONFIG.freeDeliveryThreshold;
  const minOrder = settings?.minOrderAmount || RESTAURANT_CONFIG.minOrderAmount;

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12 pb-28 md:pb-0">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                <span className="text-white font-black text-base">M</span>
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{storeName}</div>
                <div className="text-xs text-gray-500">Cloud Kitchen · Fast Delivery</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              {storeTagline}. Fresh, flavourful, and delivered to your door every day.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Contact</h3>
            <div className="space-y-2 text-xs text-gray-500">
              <a
                href={`https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Phone: {storePhone}
              </a>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {storeHours}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                {storeCity}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Order Info</h3>
            <div className="space-y-2 text-xs text-gray-500">
              <p>Free delivery on orders above ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</p>
              <p>Min order: ₹{RESTAURANT_CONFIG.minOrderAmount}</p>
              <p>Also available on Zomato</p>
              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="block text-amber-500/80 hover:text-amber-400 font-semibold transition-colors mt-2"
                >
                  🔐 Staff &amp; Admin Dashboard
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© 2025 Moonlight Kitchen. All rights reserved.</p>
          <p>Orders placed via WhatsApp · Confirmation required from kitchen</p>
        </div>
      </div>
    </footer>
  );
};
