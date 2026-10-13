import React from 'react';
import { 
  X, 
  History, 
  RotateCcw, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ChefHat
} from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { useCustomer } from '../../context/CustomerContext';
import { useCart } from '../../context/CartContext';
import { OrderRecord, OrderStatus } from '../../types/order';
import { formatINR } from '../../lib/pricing';
import { RESTAURANT_CONFIG } from '../../config/restaurant';

export const OrderHistoryModal: React.FC = () => {
  const { orders, isOrderHistoryOpen, setIsOrderHistoryOpen, reorder, isLoading } = useOrder();
  const { isVerified, setIsAuthModalOpen } = useCustomer();
  const { setIsCartOpen } = useCart();

  if (!isOrderHistoryOpen) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Awaiting Kitchen Confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Awaiting Confirmation
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            Confirmed
          </span>
        );
      case 'Preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <ChefHat className="w-3 h-3 text-purple-600" />
            Kitchen Preparing
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
            <Truck className="w-3 h-3 text-orange-600" />
            Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Cancelled
          </span>
        );
    }
  };

  const handleReorderClick = async (order: OrderRecord) => {
    const success = await reorder(order);
    if (success) {
      setIsOrderHistoryOpen(false);
      setIsCartOpen(true);
    }
  };

  const handleWhatsAppChat = (order: OrderRecord) => {
    const message = encodeURIComponent(`Hello Moonlight Kitchen, inquiring about my order reference: ${order.orderReference}`);
    window.open(`https://wa.me/${RESTAURANT_CONFIG.whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Order History</h2>
              <p className="text-xs text-slate-500">Track and reorder your past meals</p>
            </div>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {!isVerified ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Verify Phone to View Orders</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Orders placed on Moonlight Kitchen are associated with your verified phone number.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOrderHistoryOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Verify Phone Number
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <History className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No past orders yet</h3>
              <p className="text-xs text-slate-500">
                Place your first delicious order from Moonlight Kitchen!
              </p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 hover:border-slate-300 transition-colors shadow-2xs"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900">
                        {order.orderReference}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{order.createdAt}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatINR(order.pricing.finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span>
                        <strong className="text-slate-900">{item.quantity}x</strong> {item.name}
                        {item.selectedVariant ? ` (${item.selectedVariant.name})` : ''}
                        {item.selectedAddons && item.selectedAddons.length > 0
                          ? ` + ${item.selectedAddons.map(a => a.name).join(', ')}`
                          : ''}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Address Snippet */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">
                    {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}, {order.deliveryAddress.area}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => handleWhatsAppChat(order)}
                    className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Inquire on WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleReorderClick(order)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
