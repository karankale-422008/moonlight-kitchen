import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  History, 
  ChefHat, 
  MapPin, 
  Phone,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOrder } from '../../context/OrderContext';
import { formatINR } from '../../lib/pricing';
import { RESTAURANT_CONFIG } from '../../config/restaurant';

export const OrderSuccessModal: React.FC = () => {
  const { lastPlacedOrder, isSuccessModalOpen, setIsSuccessModalOpen, setIsOrderHistoryOpen } = useOrder();

  useEffect(() => {
    if (isSuccessModalOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#EA580C', '#3B82F6'],
      });
    }
  }, [isSuccessModalOpen]);

  if (!isSuccessModalOpen || !lastPlacedOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-6 animate-in zoom-in-95 duration-200 text-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Celebration Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-950/50">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Title & Reference */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-gray-400">
            Order Reference:{' '}
            <strong className="text-amber-400 font-mono tracking-wider font-extrabold">
              {lastPlacedOrder.orderReference}
            </strong>
          </p>
        </div>

        {/* Live Kitchen Status Card */}
        <div className="p-4 rounded-2xl bg-gray-800/80 border border-gray-700 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wide">
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Kitchen Status</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-green-500/10 text-green-400 border border-green-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Order Received
            </span>
          </div>

          {/* Timeline steps */}
          <div className="grid grid-cols-4 gap-1 pt-1 text-center text-[10px] font-bold">
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-green-500" />
              <span className="text-green-400">Received</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-amber-500/40" />
              <span className="text-gray-500">Preparing</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-gray-700" />
              <span className="text-gray-500">On The Way</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-gray-700" />
              <span className="text-gray-500">Delivered</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-300 pt-1 border-t border-gray-700/80">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Estimated Delivery Time: <strong>30 – 35 Mins</strong></span>
          </div>
        </div>

        {/* Order Details Brief Box */}
        <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/80 text-left space-y-2 text-xs">
          <div className="flex justify-between text-gray-300">
            <span className="text-gray-400">Customer:</span>
            <span className="font-semibold text-white">{lastPlacedOrder.customerName} (+91 {lastPlacedOrder.customerPhone})</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span className="text-gray-400">Payment:</span>
            <span className="font-semibold text-amber-400">{lastPlacedOrder.paymentPreference}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span className="text-gray-400">Items ({lastPlacedOrder.items.reduce((s, i) => s + i.quantity, 0)}):</span>
            <span className="font-semibold text-white">
              {lastPlacedOrder.items.map(i => `${i.quantity}x ${i.name}`).slice(0, 2).join(', ')}
              {lastPlacedOrder.items.length > 2 ? ' ...' : ''}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-gray-400 pt-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span className="truncate">
              {lastPlacedOrder.deliveryAddress.houseNo}, {lastPlacedOrder.deliveryAddress.area}
            </span>
          </div>
          <div className="flex justify-between font-extrabold text-white pt-2 border-t border-gray-700">
            <span>Total Payable:</span>
            <span className="text-amber-400 text-sm font-black">{formatINR(lastPlacedOrder.pricing.finalTotal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              setIsSuccessModalOpen(false);
              setIsOrderHistoryOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-900/40"
          >
            <History className="w-4 h-4" />
            <span>Track Order in My Orders</span>
          </button>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-colors border border-gray-700"
          >
            Continue Ordering Dishes
          </button>

          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
            <Phone className="w-3 h-3 text-gray-400" />
            <span>Need assistance? Moonlight Kitchen: {RESTAURANT_CONFIG.displayPhone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
