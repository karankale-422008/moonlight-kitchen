import React from 'react';
import { ShoppingBag, Utensils, History, User, Search, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useOrder } from '../../context/OrderContext';
import { formatINR } from '../../lib/pricing';

interface MobileBottomBarProps {
  onOpenSearch: () => void;
  onOpenCheckout: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onOpenSearch,
  onOpenCheckout,
}) => {
  const { totalItemCount, pricing, setIsCartOpen } = useCart();
  const { isVerified, setIsAuthModalOpen, setIsProfileModalOpen } = useCustomer();
  const { orders, setIsOrderHistoryOpen } = useOrder();

  const handleProfileClick = () => {
    if (isVerified) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Sticky Cart Summary Bar when items exist */}
      {totalItemCount > 0 && (
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-slate-950 px-4 py-2.5 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-xs">
              {totalItemCount}
            </div>
            <div>
              <div className="text-xs font-black leading-tight">
                {formatINR(pricing.finalTotal)}
              </div>
              <div className="text-[10px] text-slate-900 font-semibold">
                {pricing.isFreeDelivery ? 'FREE Delivery' : '+ Delivery ₹30'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white text-xs font-black uppercase tracking-wider shadow"
          >
            <span>View Basket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <div className="bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-1 text-orange-400 p-1"
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-bold">Menu</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white p-1"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Search</span>
        </button>

        <button
          onClick={() => setIsOrderHistoryOpen(true)}
          className="relative flex flex-col items-center gap-1 text-slate-400 hover:text-white p-1"
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">Orders</span>
          {orders.length > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
              {orders.length}
            </span>
          )}
        </button>

        <button
          onClick={handleProfileClick}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white p-1"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">{isVerified ? 'Profile' : 'Sign In'}</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-slate-400 hover:text-white p-1"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cart</span>
          {totalItemCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-orange-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
              {totalItemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
