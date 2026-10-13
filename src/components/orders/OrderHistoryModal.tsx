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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3" />
            Awaiting Confirmation
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-950/80 text-sky-300 border border-sky-500/40">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'Preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
            <ChefHat className="w-3 h-3" />
            Kitchen Preparing
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-950/80 text-orange-300 border border-orange-500/40">
            <Truck className="w-3 h-3" />
            Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3 h-3" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">My Orders</h2>
              <p className="text-xs text-slate-400">Order tracking and past order details</p>
            </div>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {!isVerified ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800 flex items-center justify-center text-slate-500">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Verify Phone to View Orders</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Orders placed by your phone number are safely stored in our database. Verify your number to view cross-device order history.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOrderHistoryOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Verify Phone Number
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <History className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">No past orders yet</h3>
              <p className="text-xs text-slate-400">
                Place your first delicious order from Moonlight Kitchen!
              </p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {order.orderReference}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{order.createdAt}</span>
                    </div>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-base font-black text-white">
                      {formatINR(order.pricing.finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>
                        <strong className="text-orange-400">{item.quantity}x</strong> {item.name}
                        {item.selectedVariant ? ` (${item.selectedVariant.name})` : ''}
                        {item.selectedAddons && item.selectedAddons.length > 0
                          ? ` + ${item.selectedAddons.map(a => a.name).join(', ')}`
                          : ''}
                      </span>
                      <span className="text-slate-400">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Address Snippet */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="truncate">
                    {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}, {order.deliveryAddress.area}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => handleWhatsAppChat(order)}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat with Kitchen</span>
                  </button>

                  <button
                    onClick={() => handleReorderClick(order)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700"
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
