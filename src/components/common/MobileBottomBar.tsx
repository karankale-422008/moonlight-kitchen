import React, { useState } from 'react';
import { Home, ShoppingBag, History, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/pricing';

interface MobileBottomBarProps {
  onOpenCheckout: () => void;
  activeTab: 'menu' | 'cart' | 'orders' | 'profile';
  onTabChange: (tab: 'menu' | 'cart' | 'orders' | 'profile') => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onOpenCheckout,
  activeTab,
  onTabChange,
}) => {
  const { totalItemCount, pricing, setIsCartOpen } = useCart();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Cart preview bar (shows when cart has items) */}
      {totalItemCount > 0 && (
        <button
          onClick={onOpenCheckout}
          className="w-full flex items-center justify-between px-5 py-3 bg-amber-500 text-gray-900 font-extrabold text-sm shadow-xl"
        >
          <div className="flex items-center gap-2">
            <span className="bg-gray-900/20 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
              {totalItemCount} items
            </span>
            <span>View Order</span>
          </div>
          <span>{formatINR(pricing.finalTotal)}</span>
        </button>
      )}

      {/* Bottom Navigation */}
      <div className="bg-gray-900 border-t border-gray-800 flex items-center">
        {[
          { id: 'menu' as const, label: 'Menu', icon: <Home className="w-5 h-5" /> },
          { id: 'cart' as const, label: 'Cart', icon: <ShoppingBag className="w-5 h-5" />, badge: totalItemCount },
          { id: 'orders' as const, label: 'Orders', icon: <History className="w-5 h-5" /> },
          { id: 'profile' as const, label: 'Profile', icon: <User className="w-5 h-5" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'cart') setIsCartOpen(true);
              else onTabChange(tab.id);
            }}
            className={`relative flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-colors ${
              activeTab === tab.id ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge != null && tab.badge > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-12px)] w-4 h-4 bg-amber-500 text-gray-900 text-[9px] font-black rounded-full flex items-center justify-center">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
