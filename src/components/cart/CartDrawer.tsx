import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, Check, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/pricing';
import { RESTAURANT_CONFIG } from '../../config/restaurant';
import { FoodImage } from '../common/FoodImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOpenCheckout }) => {
  const { items, pricing, couponCode, updateQuantity, clearCart, applyCoupon, removeCoupon } = useCart();
  const [inputCoupon, setInputCoupon] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      const ok = applyCoupon(inputCoupon);
      if (ok) setInputCoupon('');
    }
  };

  const deliveryProgress = Math.min(100, (pricing.subtotal / RESTAURANT_CONFIG.freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm bg-gray-900 border-l border-gray-700 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Your Basket</h2>
              <p className="text-xs text-gray-500">
                {items.length === 0 ? 'Empty' : `${items.reduce((s, i) => s + i.quantity, 0)} items`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-gray-600 hover:text-red-400 flex items-center gap-1 p-2 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free delivery progress */}
        {items.length > 0 && (
          <div className="px-4 py-3 bg-gray-800/60 border-b border-gray-700">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                {pricing.isFreeDelivery ? (
                  <span className="text-green-400 font-bold">🎉 FREE Delivery Unlocked!</span>
                ) : (
                  <span>Add <strong className="text-amber-400">{formatINR(pricing.amountNeededForFreeDelivery)}</strong> more</span>
                )}
              </span>
              <span className="text-gray-600">Goal ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${pricing.isFreeDelivery ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-200">Your basket is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">Discover pizzas, burgers, biryanis from Moonlight Kitchen</p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="p-3 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center gap-3">
                <FoodImage src={item.image} alt={item.name} className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-100 truncate">{item.name}</h4>
                  {item.selectedVariant && (
                    <div className="text-[10px] text-amber-400">{item.selectedVariant.name}</div>
                  )}
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div className="text-[10px] text-gray-500 truncate">+ {item.selectedAddons.map(a => a.name).join(', ')}</div>
                  )}
                  <div className="text-xs font-extrabold text-white mt-0.5">{formatINR(item.unitPrice * item.quantity)}</div>
                </div>
                <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg overflow-hidden shrink-0 h-8">
                  <button onClick={() => updateQuantity(item.id, -1)} className="px-2.5 h-full text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-black text-sm text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="px-2.5 h-full text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill + Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-700 space-y-3">
            {/* Coupon */}
            {couponCode ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-xs">
                <div className="flex items-center gap-1.5 text-green-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>{couponCode} applied!</span>
                </div>
                <button onClick={removeCoupon} className="text-red-400 hover:text-red-300 text-[11px]">Remove</button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Add coupon code..."
                    value={inputCoupon}
                    onChange={e => setInputCoupon(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-2 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-xs text-gray-200 uppercase font-medium placeholder-gray-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-xl transition-colors">
                  Apply
                </button>
              </form>
            )}

            {/* Bill */}
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-200 font-semibold">{formatINR(pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{pricing.isFreeDelivery ? <strong className="text-green-400">FREE</strong> : formatINR(pricing.deliveryCharge)}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>Coupon Savings</span>
                  <span>-{formatINR(pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-white pt-2.5 border-t border-gray-700">
                <span>To Pay</span>
                <span className="text-amber-400">{formatINR(pricing.finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => { onClose(); onOpenCheckout(); }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-extrabold text-sm shadow-lg transition-all active:scale-[0.99]"
            >
              <span>Proceed to Order</span>
              <div className="flex items-center gap-1.5">
                <span>{formatINR(pricing.finalTotal)}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
