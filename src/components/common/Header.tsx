import React from 'react';
import { ShoppingBag, User, History, Search, Moon, Sparkles, Shield, PhoneCall } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useOrder } from '../../context/OrderContext';
import { RESTAURANT_CONFIG } from '../../config/restaurant';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenAdmin }) => {
  const { totalItemCount, setIsCartOpen } = useCart();
  const { profile, isVerified, setIsAuthModalOpen, setIsProfileModalOpen } = useCustomer();
  const { orders, setIsOrderHistoryOpen } = useOrder();

  const handleProfileClick = () => {
    if (isVerified) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      {/* Top micro-bar: Free delivery & direct call notification */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-slate-950 px-4 py-1 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>FREE HOME DELIVERY on orders above ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}!</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={`tel:${RESTAURANT_CONFIG.displayPhone.replace(/\s+/g, '')}`}
            className="flex items-center gap-1 hover:underline text-slate-900"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Order Line: {RESTAURANT_CONFIG.displayPhone}</span>
          </a>
          <span className="opacity-40">•</span>
          <span className="text-[11px] font-medium text-slate-900/80">Hours: {RESTAURANT_CONFIG.operatingHours}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Moon className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
                Moonlight <span className="text-orange-500">Kitchen</span>
              </h1>
            </div>
            <p className="text-[10px] tracking-widest uppercase font-semibold text-amber-400/90 hidden sm:block">
              {RESTAURANT_CONFIG.tagline}
            </p>
          </div>
        </div>

        {/* Center/Search Quick Trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-orange-500/50 transition-all text-sm group"
          >
            <Search className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Search pizzas, burgers, biryanis, shakes...</span>
            <kbd className="ml-auto text-[10px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
              /
            </kbd>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Search Menu"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Orders History Button */}
          <button
            onClick={() => setIsOrderHistoryOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all text-xs font-semibold"
            title="My Orders"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Orders</span>
            {orders.length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {orders.length}
              </span>
            )}
          </button>

          {/* Customer Profile Button */}
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all text-xs font-semibold"
            title="Account & Addresses"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center text-slate-950 text-[10px] font-black">
              {isVerified && profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <User className="w-3 h-3 text-slate-900" />}
            </div>
            <span className="hidden sm:inline">
              {isVerified && profile?.fullName ? profile.fullName.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold shadow-md shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Basket</span>
            {totalItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-xs flex items-center justify-center font-bold">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* Discreet Admin Lock Button */}
          <button
            onClick={onOpenAdmin}
            className="p-2 text-slate-500 hover:text-orange-400 transition-colors ml-1"
            title="Owner & Kitchen Portal"
            aria-label="Admin Portal"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
