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
      // Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fbbf24', '#10b981', '#38bdf8'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-6 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Celebration Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Title & Reference */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Order Request Saved!
          </h2>
          <p className="text-xs text-slate-400">
            Order Reference:{' '}
            <strong className="text-amber-400 font-mono tracking-wider font-bold">
              {lastPlacedOrder.orderReference}
            </strong>
          </p>
        </div>

        {/* Essential WhatsApp Notice */}
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Action Required in WhatsApp</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Your browser opened WhatsApp with your complete order pre-filled. Please <strong>tap Send</strong> inside WhatsApp to transmit it to Moonlight Kitchen.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 pt-1 border-t border-amber-500/20">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Order Status: <strong>Awaiting Kitchen Confirmation</strong></span>
          </div>
        </div>

        {/* Order Details Brief Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
          <div className="flex justify-between font-bold text-slate-200">
            <span>Customer:</span>
            <span>{lastPlacedOrder.customerName} (+91 {lastPlacedOrder.customerPhone})</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Items Ordered:</span>
            <span>{lastPlacedOrder.items.reduce((s, i) => s + i.quantity, 0)} items</span>
          </div>
          <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
            <span>Total Payable:</span>
            <span className="text-orange-400 text-sm">{formatINR(lastPlacedOrder.pricing.finalTotal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleOpenWhatsAppAgain}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Re-open WhatsApp Chat</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyMessage}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
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
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>View Order History</span>
            </button>
          </div>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="text-xs text-slate-400 hover:text-white pt-1"
          >
            Back to Moonlight Kitchen Menu
          </button>
        </div>
      </div>
    </div>
  );
};
