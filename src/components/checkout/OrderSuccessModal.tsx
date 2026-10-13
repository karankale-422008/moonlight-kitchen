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
        colors: ['#F59E0B', '#10B981', '#EA580C', '#3B82F6'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-6 animate-in zoom-in-95 duration-200 text-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Celebration Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Title & Reference */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Order Request Saved!
          </h2>
          <p className="text-xs text-gray-400">
            Order Reference:{' '}
            <strong className="text-amber-400 font-mono tracking-wider font-extrabold">
              {lastPlacedOrder.orderReference}
            </strong>
          </p>
        </div>

        {/* WhatsApp Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Important: Tap Send in WhatsApp</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            WhatsApp has been opened with your order summary. Please <strong>tap Send</strong> inside WhatsApp to confirm your order with Moonlight Kitchen.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium pt-1 border-t border-amber-500/20">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Status: <strong>Awaiting Kitchen Confirmation</strong></span>
          </div>
        </div>

        {/* Order Details Brief Box */}
        <div className="p-4 rounded-2xl bg-gray-800/70 border border-gray-700 text-left space-y-2 text-xs">
          <div className="flex justify-between font-bold text-gray-200">
            <span>Customer:</span>
            <span>{lastPlacedOrder.customerName} (+91 {lastPlacedOrder.customerPhone})</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Items Ordered:</span>
            <span>{lastPlacedOrder.items.reduce((s, i) => s + i.quantity, 0)} items</span>
          </div>
          <div className="flex justify-between font-extrabold text-white pt-2 border-t border-gray-700">
            <span>Total Payable:</span>
            <span className="text-amber-400 text-sm">{formatINR(lastPlacedOrder.pricing.finalTotal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleOpenWhatsAppAgain}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-green-900/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Re-open WhatsApp Chat</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyMessage}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors border border-gray-700"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
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
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors border border-gray-700"
            >
              <History className="w-3.5 h-3.5 text-gray-400" />
              <span>View Orders</span>
            </button>
          </div>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="text-xs text-gray-500 hover:text-gray-300 pt-1 font-medium transition-colors"
          >
            Back to Moonlight Kitchen Menu
          </button>
        </div>
      </div>
    </div>
  );
};
