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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" />
            Awaiting Confirmation
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <CheckCircle2 className="w-3 h-3 text-sky-400" />
            Confirmed
          </span>
        );
      case 'Preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <ChefHat className="w-3 h-3 text-purple-400" />
            Kitchen Preparing
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Truck className="w-3 h-3 text-orange-400" />
            Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3 h-3 text-red-400" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 text-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Your Past Orders</h2>
              <p className="text-xs text-gray-400">
                Track status, review bill summaries &amp; 1-click reorder
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {orders.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500">
                <History className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-200">No Orders Yet</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Once you order your favourite pizzas, burgers, or biryani, your records will be displayed here.
                </p>
              </div>
              <button
                onClick={() => setIsOrderHistoryOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-900/30"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-gray-800/60 border border-gray-700/80 space-y-3.5 hover:border-gray-600 transition-all shadow-sm"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-700/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-white tracking-wide">
                        {order.orderReference}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span>{order.createdAt}</span>
                      <span>•</span>
                      <span>{order.paymentPreference}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-amber-400">
                      {formatINR(order.pricing.finalTotal)}
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} Items
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1.5 text-xs text-gray-300">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span className="flex-1 truncate pr-2">
                        <strong className="text-gray-400">{item.quantity}x</strong> {item.name}
                        {item.selectedVariant && (
                          <span className="text-amber-400/80 text-[11px] ml-1">
                            ({item.selectedVariant.name})
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-gray-200 shrink-0">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Address Snippet */}
                <div className="flex items-start gap-1.5 text-xs text-gray-400 bg-gray-900/60 p-2.5 rounded-xl border border-gray-800">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span className="truncate">
                    {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}, {order.deliveryAddress.area}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleWhatsAppChat(order)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-700/80 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                    <span>Inquire</span>
                  </button>

                  <button
                    onClick={() => handleReorderClick(order)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 text-xs font-bold transition-all shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
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
