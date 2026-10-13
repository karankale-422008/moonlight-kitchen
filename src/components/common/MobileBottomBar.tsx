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
      {/* Sticky Cart Summary Bar when items exist in cart */}
      {totalItemCount > 0 && (
        <div 
          onClick={() => setIsCartOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 shadow-xl flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-800 text-white flex items-center justify-center font-extrabold text-xs">
              {totalItemCount}
            </div>
            <div>
              <div className="text-xs font-black leading-tight">
                {formatINR(pricing.finalTotal)}
              </div>
              <div className="text-[10px] text-orange-100 font-medium">
                {pricing.isFreeDelivery ? 'FREE Delivery' : '+ Delivery ₹30'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-0.5 text-orange-600 p-1"
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-bold">Menu</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 p-1"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Search</span>
        </button>

        <button
          onClick={() => setIsOrderHistoryOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 p-1"
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">Orders</span>
          {orders.length > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[9px] font-black flex items-center justify-center">
              {orders.length}
            </span>
          )}
        </button>

        <button
          onClick={handleProfileClick}
          className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 p-1"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">{isVerified ? 'Profile' : 'Sign In'}</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 p-1"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cart</span>
          {totalItemCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-orange-600 text-white text-[9px] font-black flex items-center justify-center">
              {totalItemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
