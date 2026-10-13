import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  Check, 
  Truck 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { DietaryBadge } from '../common/DietaryBadge';
import { formatINR } from '../../lib/pricing';
import { RESTAURANT_CONFIG } from '../../config/restaurant';

interface DesktopCartPanelProps {
  onOpenCheckout: () => void;
}

export const DesktopCartPanel: React.FC<DesktopCartPanelProps> = ({ onOpenCheckout }) => {
  const {
    items,
    pricing,
    couponCode,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      const ok = applyCoupon(inputCoupon);
      if (ok) setInputCoupon('');
    }
  };

  const deliveryProgress = Math.min(
    100,
    (pricing.subtotal / RESTAURANT_CONFIG.freeDeliveryThreshold) * 100
  );

  return (
    <div className="w-96 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl flex flex-col h-[calc(100vh-6.5rem)] sticky top-24 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Your Basket</h3>
            <p className="text-[11px] text-slate-400">
              {items.length === 0 ? 'Empty' : `${items.reduce((s, i) => s + i.quantity, 0)} items`}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-rose-400 p-1.5 transition-colors flex items-center gap-1"
            title="Clear basket"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Free Delivery Meter */}
      {items.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-orange-400" />
              {pricing.isFreeDelivery ? (
                <span className="text-emerald-400 font-bold">FREE Home Delivery!</span>
              ) : (
                <span>Add <strong className="text-orange-400">{formatINR(pricing.amountNeededForFreeDelivery)}</strong> more</span>
              )}
            </span>
            <span className="text-[10px] text-slate-400">₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                pricing.isFreeDelivery
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${deliveryProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-600">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-300">Your basket is empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add mouthwatering items to order
              </p>
            </div>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="p-2.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between gap-2 hover:border-slate-600 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <DietaryBadge type={item.dietary} />
                  <h4 className="text-xs font-bold text-white truncate">
                    {item.name}
                  </h4>
                </div>
                {item.selectedVariant && (
                  <div className="text-[10px] text-amber-400 font-medium">
                    {item.selectedVariant.name}
                  </div>
                )}
                <div className="text-xs font-bold text-white mt-0.5">
                  {formatINR(item.unitPrice * item.quantity)}
                </div>
              </div>

              {/* Quantity buttons */}
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Decrease"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 font-bold text-xs text-white min-w-[16px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Increase"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill & Checkout Bottom Area */}
      {items.length > 0 && (
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-3">
          {/* Quick coupon */}
          <div>
            {couponCode ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>{couponCode}</strong> applied</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-rose-400 hover:text-rose-300 text-[10px]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                <div className="relative flex-1">
                  <Tag className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={inputCoupon}
                    onChange={e => setInputCoupon(e.target.value.toUpperCase())}
                    className="w-full pl-7 pr-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Pricing summary */}
          <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-slate-800">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="text-slate-200">{formatINR(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>
                {pricing.isFreeDelivery ? (
                  <strong className="text-emerald-400">FREE</strong>
                ) : (
                  formatINR(pricing.deliveryCharge)
                )}
              </span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span>-{formatINR(pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-slate-800">
              <span>To Pay</span>
              <span className="text-orange-400">{formatINR(pricing.finalTotal)}</span>
            </div>
          </div>

          <button
            onClick={onOpenCheckout}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 transition-all uppercase tracking-wider"
          >
            <span>Proceed to Checkout</span>
            <div className="flex items-center gap-1">
              <span>{formatINR(pricing.finalTotal)}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
