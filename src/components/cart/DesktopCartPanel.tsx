import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  Check, 
  Truck,
  Clock,
  ShieldCheck 
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
    <div className="w-96 bg-white border border-slate-200/90 rounded-3xl shadow-xs flex flex-col h-[calc(100vh-6.5rem)] sticky top-24 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Your Basket</h3>
            <p className="text-[11px] text-slate-500">
              {items.length === 0 ? 'Empty' : `${items.reduce((s, i) => s + i.quantity, 0)} items selected`}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-rose-600 p-1.5 transition-colors flex items-center gap-1"
            title="Clear basket"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Free Delivery Meter */}
      {items.length > 0 && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-orange-600" />
              {pricing.isFreeDelivery ? (
                <span className="text-emerald-700 font-bold">FREE Delivery Unlocked!</span>
              ) : (
                <span>Add <strong className="text-orange-600">{formatINR(pricing.amountNeededForFreeDelivery)}</strong> for FREE Delivery</span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Goal: ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                pricing.isFreeDelivery ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
              style={{ width: `${deliveryProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Your basket is empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add freshly prepared items from the menu
              </p>
            </div>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <DietaryBadge type={item.dietary} />
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.name}
                  </h4>
                </div>
                {item.selectedVariant && (
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                    Size: {item.selectedVariant.name}
                  </div>
                )}
                {item.selectedAddons && item.selectedAddons.length > 0 && (
                  <div className="text-[10px] text-slate-500 truncate">
                    + {item.selectedAddons.map(a => a.name).join(', ')}
                  </div>
                )}
                <div className="text-xs font-extrabold text-slate-900 mt-1">
                  {formatINR(item.unitPrice * item.quantity)}
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 h-8">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="px-2 h-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  aria-label="Decrease"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 font-bold text-xs text-slate-900 min-w-[16px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="px-2 h-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
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
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 space-y-3">
          {/* Coupon Code Input */}
          <div>
            {couponCode ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>{couponCode}</strong> applied</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-rose-600 hover:underline text-[11px]"
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
                    placeholder="Coupon (e.g. MOONLIGHT10)"
                    value={inputCoupon}
                    onChange={e => setInputCoupon(e.target.value.toUpperCase())}
                    className="w-full pl-7 pr-2 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 uppercase font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Bill details */}
          <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200/80">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="text-slate-900 font-semibold">{formatINR(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>
                {pricing.isFreeDelivery ? (
                  <strong className="text-emerald-700">FREE</strong>
                ) : (
                  formatINR(pricing.deliveryCharge)
                )}
              </span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount</span>
                <span>-{formatINR(pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>To Pay</span>
              <span className="text-orange-600">{formatINR(pricing.finalTotal)}</span>
            </div>
          </div>

          <button
            onClick={onOpenCheckout}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md shadow-orange-600/20 transition-all uppercase tracking-wider"
          >
            <span>Proceed to Checkout</span>
            <div className="flex items-center gap-1">
              <span>{formatINR(pricing.finalTotal)}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
