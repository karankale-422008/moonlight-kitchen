import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  History, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOrder } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { getWhatsAppOrderUrl } from '../../lib/whatsapp';
import { formatINR } from '../../lib/pricing';

export const OrderSuccessModal: React.FC = () => {
  const { lastPlacedOrder, isSuccessModalOpen, setIsSuccessModalOpen, setIsOrderHistoryOpen } = useOrder();
  const { showToast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (isSuccessModalOpen) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#16a34a', '#0284c7', '#f59e0b'],
      });
    }
  }, [isSuccessModalOpen]);

  if (!isSuccessModalOpen || !lastPlacedOrder) return null;

  const handleCopyMessage = () => {
    if (lastPlacedOrder.whatsappMessage) {
      navigator.clipboard.writeText(lastPlacedOrder.whatsappMessage);
      setHasCopied(true);
      showToast('Order message copied to clipboard!', 'success');
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

  const handleOpenWhatsAppAgain = () => {
    const url = getWhatsAppOrderUrl(lastPlacedOrder);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-6 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Celebration Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Title & Reference */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Order Request Saved!
          </h2>
          <p className="text-xs text-slate-500">
            Order Reference:{' '}
            <strong className="text-slate-900 font-mono tracking-wider font-extrabold">
              {lastPlacedOrder.orderReference}
            </strong>
          </p>
        </div>

        {/* WhatsApp Notice */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Important: Tap Send in WhatsApp</span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            WhatsApp was opened with your complete order details. Please <strong>tap Send</strong> inside WhatsApp to confirm your order with Moonlight Kitchen.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium pt-1 border-t border-amber-200">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Status: <strong>Awaiting Kitchen Confirmation</strong></span>
          </div>
        </div>

        {/* Order Details Brief Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between font-bold text-slate-800">
            <span>Customer:</span>
            <span>{lastPlacedOrder.customerName} (+91 {lastPlacedOrder.customerPhone})</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Items Ordered:</span>
            <span>{lastPlacedOrder.items.reduce((s, i) => s + i.quantity, 0)} items</span>
          </div>
          <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Payable:</span>
            <span className="text-orange-600 text-sm">{formatINR(lastPlacedOrder.pricing.finalTotal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleOpenWhatsAppAgain}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Re-open WhatsApp Chat</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyMessage}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setIsOrderHistoryOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>View Orders</span>
            </button>
          </div>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="text-xs text-slate-500 hover:text-slate-900 pt-1 font-medium"
          >
            Back to Moonlight Kitchen Menu
          </button>
        </div>
      </div>
    </div>
  );
};
