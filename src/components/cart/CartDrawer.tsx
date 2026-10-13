import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
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

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
}) => {
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Your Basket</h2>
              <p className="text-xs text-slate-500">
                {items.length === 0 ? 'Empty' : `${items.reduce((s, i) => s + i.quantity, 0)} items`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-rose-600 p-2 transition-colors flex items-center gap-1"
                title="Clear basket"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Meter */}
        {items.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-orange-600" />
                {pricing.isFreeDelivery ? (
                  <span className="text-emerald-700 font-bold">FREE Delivery Unlocked!</span>
                ) : (
                  <span>Add <strong className="text-orange-600">{formatINR(pricing.amountNeededForFreeDelivery)}</strong> more for FREE Delivery</span>
                )}
              </span>
              <span className="text-[10px] text-slate-400">Goal: ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}</span>
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

        {/* Item List / Empty State */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-18 h-18 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Your basket is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Discover pizzas, burgers, biryanis, and shakes from Moonlight Kitchen.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <DietaryBadge type={item.dietary} />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.name}
                      </h4>
                    </div>
                    {item.selectedVariant && (
                      <div className="text-[11px] text-amber-700 font-medium">
                        Size: {item.selectedVariant.name}
                      </div>
                    )}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="text-[11px] text-slate-500 truncate">
                        + {item.selectedAddons.map(a => a.name).join(', ')}
                      </div>
                    )}
                    <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                      {formatINR(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 h-8">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="px-2 h-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 font-bold text-xs text-slate-900 min-w-[18px] text-center">
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
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
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
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon (e.g. MOONLIGHT10)"
                      value={inputCoupon}
                      onChange={e => setInputCoupon(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-2 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 uppercase font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Bill Details */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900 font-semibold">{formatINR(pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
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
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md transition-all uppercase tracking-wider"
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
    </div>
  );
};
