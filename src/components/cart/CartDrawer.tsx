import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  Sparkles, 
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
    removeItem,
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-out Drawer Panel */}
      <div
        className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Your Basket</h2>
              <p className="text-xs text-slate-400">
                {items.length === 0
                  ? 'Empty'
                  : `${items.reduce((s, i) => s + i.quantity, 0)} items selected`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-rose-400 p-2 transition-colors flex items-center gap-1"
                title="Clear basket"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Meter */}
        {items.length > 0 && (
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-orange-400" />
                {pricing.isFreeDelivery ? (
                  <span className="text-emerald-400 font-bold">
                    Unlocked FREE Home Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-orange-400">{formatINR(pricing.amountNeededForFreeDelivery)}</strong> more for FREE Delivery
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-400">
                Goal: ₹{RESTAURANT_CONFIG.freeDeliveryThreshold}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  pricing.isFreeDelivery
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
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
              <div className="w-20 h-20 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-600">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-200">Your basket is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Discover mouthwatering pizzas, burgers, biryanis, and shakes from Moonlight Kitchen.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 hover:border-slate-600 transition-colors"
              >
                {/* Left image & item info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-13 h-13 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <DietaryBadge type={item.dietary} />
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.name}
                      </h4>
                    </div>

                    {/* Variant and Addons */}
                    <div className="text-[11px] text-slate-400 space-y-0.5 mt-0.5">
                      {item.selectedVariant && (
                        <div className="text-amber-400 font-medium">
                          Size: {item.selectedVariant.name}
                        </div>
                      )}
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="truncate">
                          + {item.selectedAddons.map(a => a.name).join(', ')}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="italic text-slate-400 text-[10px] truncate">
                          "{item.specialInstructions}"
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-bold text-white mt-1">
                      {formatINR(item.unitPrice * item.quantity)}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">
                        ({formatINR(item.unitPrice)} each)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Quantity Controls */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-bold text-xs text-white min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Checkout & Bill Section */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-4">
            {/* Coupon Code Section */}
            <div>
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Coupon <strong>{couponCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-rose-400 hover:text-rose-300 text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon (e.g. MOONLIGHT10)"
                      value={inputCoupon}
                      onChange={e => setInputCoupon(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Quick coupons pills */}
              {!couponCode && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Try:</span>
                  <button
                    type="button"
                    onClick={() => applyCoupon('MOONLIGHT10')}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 px-2 py-0.5 rounded-full"
                  >
                    MOONLIGHT10 (10% off &gt;₹199)
                  </button>
                </div>
              )}
            </div>

            {/* Bill Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="text-slate-200 font-medium">{formatINR(pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {pricing.isFreeDelivery ? (
                    <span className="text-emerald-400 font-bold">FREE</span>
                  ) : (
                    formatINR(pricing.deliveryCharge)
                  )}
                </span>
              </div>
              {pricing.packagingCharge > 0 && (
                <div className="flex justify-between">
                  <span>Packaging Charge</span>
                  <span>{formatINR(pricing.packagingCharge)}</span>
                </div>
              )}
              {pricing.tax > 0 && (
                <div className="flex justify-between">
                  <span>Taxes & Charges</span>
                  <span>{formatINR(pricing.tax)}</span>
                </div>
              )}
              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Discount Applied</span>
                  <span>-{formatINR(pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-black text-white pt-2 border-t border-slate-800">
                <span>To Pay</span>
                <span className="text-orange-400">{formatINR(pricing.finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-sm shadow-xl shadow-orange-500/20 transition-all"
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
