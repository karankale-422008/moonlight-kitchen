import React from 'react';
import { Moon, Phone, MapPin, Clock, MessageSquare, Heart, ShieldCheck, Truck } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../../config/restaurant';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 mt-20 pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                <Moon className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              </div>
              <span className="text-xl font-bold text-white font-serif">
                Moonlight <span className="text-orange-500">Kitchen</span>
              </span>
            </div>
            <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
              {RESTAURANT_CONFIG.tagline}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Serving freshly baked artisanal pizzas, juicy burgers, loaded jumbo grilled sandwiches, crispy fries, hot Maggi, chilled thick shakes, and aromatic dum biryanis.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-600/30 text-orange-300 text-xs font-medium">
              <Truck className="w-3.5 h-3.5" />
              <span>Free Delivery Above ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</span>
            </div>
          </div>

          {/* Contact & WhatsApp */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wide">Direct WhatsApp Order</h3>
            <p className="text-xs text-slate-400">
              Orders placed online are seamlessly formatted and transmitted directly to our kitchen WhatsApp dispatch.
            </p>
            <a
              href={`https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp: {RESTAURANT_CONFIG.displayPhone}</span>
            </a>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>Call: {RESTAURANT_CONFIG.displayPhone}</span>
            </div>
          </div>

          {/* Delivery & Operating Times */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wide">Timings & Service Area</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                <span>Operating Hours:<br /><strong className="text-slate-200">{RESTAURANT_CONFIG.operatingHours}</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                <span>Kitchen Location:<br /><strong className="text-slate-200">{RESTAURANT_CONFIG.address}</strong></span>
              </div>
            </div>
          </div>

          {/* Delivery Partners & Highlights */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wide">Order Online</h3>
            <p className="text-xs text-slate-400">
              Order directly here on our web platform for exclusive combo deals, free home delivery, and direct kitchen service.
            </p>
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block mb-1">Also listed on delivery partner:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold tracking-wider uppercase">
                Zomato Verified
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 pt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Fresh Ingredients & Hygienic Preparation</span>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>© {new Date().getFullYear()} Moonlight Kitchen.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-medium">
            <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
            <span>Thank you and order again</span>
            <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
