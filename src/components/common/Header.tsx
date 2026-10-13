import React from 'react';
import { 
  ShoppingBag, 
  User, 
  History, 
  Search, 
  MapPin, 
  Moon, 
  Percent, 
  Shield, 
  ChevronDown, 
  Clock 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useOrder } from '../../context/OrderContext';
import { RESTAURANT_CONFIG } from '../../config/restaurant';
import { formatINR } from '../../lib/pricing';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenAdmin }) => {
  const { totalItemCount, pricing, setIsCartOpen } = useCart();
  const { profile, isVerified, activeAddress, setIsAuthModalOpen, setIsProfileModalOpen } = useCustomer();
  const { orders, setIsOrderHistoryOpen } = useOrder();

  const handleProfileClick = () => {
    if (isVerified) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Delivery Announcement Strip */}
      <div className="bg-slate-900 text-white text-xs px-4 py-1.5 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Kitchen is Open &amp; Delivering</span>
          <span className="text-slate-500">•</span>
          <span className="text-orange-400 font-semibold">FREE delivery on orders over ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-300 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>Avg delivery: 30-35 mins</span>
          </span>
          <span className="text-slate-600">|</span>
          <a
            href={`tel:${RESTAURANT_CONFIG.displayPhone.replace(/\s+/g, '')}`}
            className="hover:text-white transition-colors"
          >
            Direct Kitchen: {RESTAURANT_CONFIG.displayPhone}
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand & Delivery Address */}
        <div className="flex items-center gap-6">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20 group-hover:bg-orange-700 transition-colors">
              <Moon className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 font-serif">
                  Moonlight <span className="text-orange-600">Kitchen</span>
                </span>
              </div>
              <p className="text-[10px] tracking-wider uppercase font-bold text-slate-500">
                Cloud Kitchen &amp; Quick Delivery
              </p>
            </div>
          </div>

          {/* Delivery Location Indicator (Swiggy / Zomato style) */}
          <button
            onClick={handleProfileClick}
            className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 text-left hover:opacity-80 transition-opacity"
            title="Change Delivery Location"
          >
            <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
            <div className="max-w-[200px]">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <span className="truncate">{activeAddress ? activeAddress.tag : 'Delivery Area'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {activeAddress ? `${activeAddress.area}, ${activeAddress.city}` : 'Select your address'}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Search trigger */}
        <div className="hidden md:flex flex-1 max-w-sm mx-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-400 hover:text-slate-600 transition-all text-xs"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="truncate">Search for pizza, burger, biryani...</span>
            <kbd className="ml-auto text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-mono shadow-2xs">
              /
            </kbd>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Orders History Button */}
          <button
            onClick={() => setIsOrderHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-xs font-semibold"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Orders</span>
            {orders.length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {orders.length}
              </span>
            )}
          </button>

          {/* Customer Profile Button */}
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-xs font-semibold"
          >
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
              {isVerified && profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:inline">
              {isVerified && profile?.fullName ? profile.fullName.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Cart Pill Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalItemCount > 0 ? (
              <span className="bg-orange-800 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {totalItemCount} • {formatINR(pricing.finalTotal)}
              </span>
            ) : (
              <span className="bg-orange-700/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                0
              </span>
            )}
          </button>

          {/* Discreet Owner Admin Button */}
          <button
            onClick={onOpenAdmin}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            title="Kitchen Owner Portal"
            aria-label="Admin Portal"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
