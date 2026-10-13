import React from 'react';
import {
  ShoppingBag,
  User,
  History,
  Search,
  MapPin,
  ChevronDown,
  Clock,
  Shield,
  Zap,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useOrder } from '../../context/OrderContext';
import { RESTAURANT_CONFIG } from '../../config/restaurant';
import { formatINR } from '../../lib/pricing';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCloseSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAdmin,
  isSearchOpen,
  searchQuery,
  onSearchChange,
  onCloseSearch,
}) => {
  const { totalItemCount, pricing, setIsCartOpen } = useCart();
  const { profile, isVerified, activeAddress, setIsAuthModalOpen, setIsProfileModalOpen } = useCustomer();
  const { orders, setIsOrderHistoryOpen } = useOrder();

  const handleProfileClick = () => {
    if (isVerified) setIsProfileModalOpen(true);
    else setIsAuthModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800/80 glass">
      {/* Promo Stripe */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-[11px] px-4 py-1.5 flex items-center justify-center gap-3 font-medium">
        <Zap className="w-3 h-3 fill-current shrink-0" />
        <span>FREE delivery on orders above ₹{RESTAURANT_CONFIG.freeDeliveryThreshold} • Use code <strong className="text-amber-200">MOONLIGHT10</strong> for 10% off</span>
        <span className="hidden sm:flex items-center gap-1 text-gray-400">
          <Clock className="w-3 h-3" />
          {RESTAURANT_CONFIG.operatingHours}
        </span>
      </div>

      {/* Main Nav */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Brand */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
            <span className="text-white font-black text-base leading-none">M</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-extrabold text-white tracking-tight leading-none">
              Moonlight <span className="text-amber-400">Kitchen</span>
            </div>
            <div className="text-[10px] text-gray-500 font-medium tracking-widest uppercase mt-0.5">
              Cloud Kitchen
            </div>
          </div>
        </button>

        {/* Delivery Address */}
        <button
          onClick={handleProfileClick}
          className="hidden lg:flex items-center gap-2 pl-4 border-l border-gray-700 text-left hover:opacity-80 transition-opacity"
        >
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-200">
              <span className="max-w-[140px] truncate">{activeAddress ? activeAddress.tag : 'Delivery Area'}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
            <p className="text-[10px] text-gray-500 max-w-[160px] truncate">
              {activeAddress ? `${activeAddress.area}, ${activeAddress.city}` : 'Add delivery address'}
            </p>
          </div>
        </button>

        {/* Search Bar (Desktop) */}
        {isSearchOpen ? (
          <div className="flex-1 flex items-center gap-2 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search for pizza, biryani, burger..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <button
              onClick={onCloseSearch}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenSearch}
            className="hidden md:flex flex-1 max-w-md mx-auto items-center gap-2.5 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-gray-300 transition-all"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="truncate">Search for dishes...</span>
            <kbd className="ml-auto text-[10px] text-gray-600 bg-gray-700 px-1.5 py-0.5 rounded font-mono">/</kbd>
          </button>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Mobile Search */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Orders */}
          <button
            onClick={() => setIsOrderHistoryOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-xs font-semibold"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
            {orders.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-gray-900 text-[9px] font-black rounded-full flex items-center justify-center">
                {orders.length > 9 ? '9+' : orders.length}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-xs font-semibold"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-gray-900 text-xs font-black">
              {isVerified && profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:inline">
              {isVerified && profile?.fullName ? profile.fullName.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs shadow-lg shadow-amber-900/30 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalItemCount > 0 ? (
              <span className="bg-gray-900/30 text-gray-900 text-[11px] font-black px-2 py-0.5 rounded-full">
                {totalItemCount} • {formatINR(pricing.finalTotal)}
              </span>
            ) : (
              <span className="bg-gray-900/20 text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                0
              </span>
            )}
          </button>

          {/* Admin - subtle */}
          <button
            onClick={onOpenAdmin}
            className="p-2 text-gray-600 hover:text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
            title="Kitchen Admin Portal"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
