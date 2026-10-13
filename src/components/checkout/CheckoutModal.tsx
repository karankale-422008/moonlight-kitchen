import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useOrder } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { CustomerAddress } from '../../types/customer';
import { PaymentPreference } from '../../types/order';
import { formatINR } from '../../lib/pricing';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, pricing } = useCart();
  const { profile, activeAddress, updateProfile, addAddress } = useCustomer();
  const { createOrder } = useOrder();
  const { showToast } = useToast();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync profile data when opened
  useEffect(() => {
    if (isOpen) {
      if (profile) {
        setFullName(profile.fullName || '');
        setPhone(profile.phone || '');
      }

      if (activeAddress) {
        setHouseNo(activeAddress.houseNo || '');
        setStreet(activeAddress.street || '');
        setArea(activeAddress.area || '');
        setCity(activeAddress.city || '');
        setPincode(activeAddress.pincode || '');
        setLandmark(activeAddress.landmark || '');
        setDeliveryInstructions(activeAddress.deliveryInstructions || '');
      } else {
        // Defaults
        setCity('Delivery City');
        setPincode('400001');
      }
      setValidationError(null);
    }
  }, [isOpen, profile, activeAddress]);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Validate cart
    if (items.length === 0) {
      setValidationError('Your basket is empty. Please select food items first.');
      return;
    }

    // 2. Validate customer information
    if (!fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // 3. Validate address
    if (!houseNo.trim()) {
      setValidationError('Please enter Flat / House / Building details.');
      return;
    }
    if (!street.trim()) {
      setValidationError('Please enter Street / Road name.');
      return;
    }
    if (!area.trim()) {
      setValidationError('Please enter Area / Locality.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build address object
      const addressObj: CustomerAddress = {
        id: activeAddress?.id || `addr_${Date.now()}`,
        tag: activeAddress?.tag || 'Home',
        houseNo: houseNo.trim(),
        street: street.trim(),
        area: area.trim(),
        city: city.trim() || 'Delivery City',
        state: 'State',
        pincode: pincode.trim() || '400001',
        landmark: landmark.trim() || undefined,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        isDefault: true,
      };

      // Save to customer profile in the background
      if (profile) {
        await updateProfile({ fullName: fullName.trim(), phone: cleanPhone });
        if (!activeAddress) {
          await addAddress(addressObj);
        }
      }

      // Create authoritative order record and trigger WhatsApp
      const created = await createOrder(
        items,
        pricing,
        addressObj,
        paymentPreference,
        deliveryInstructions.trim() || undefined
      );

      if (created) {
        onClose();
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      showToast(err.message || 'Failed to submit order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Checkout & Delivery</span>
            </h2>
            <p className="text-xs text-slate-400">
              Review your details and place order via WhatsApp
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Customer Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>1. Customer Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  WhatsApp Mobile Number (10 Digits) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-800 bg-slate-800 text-slate-300 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-r-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Details */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>2. Delivery Address</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Flat / House / Building *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Sunshine Apts"
                  value={houseNo}
                  onChange={e => setHouseNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Street / Road *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MG Road, Near Central Mall"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Area / Locality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 14 / Shivaji Nagar"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite City Hospital"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ring the bell twice, leave with security..."
                value={deliveryInstructions}
                onChange={e => setDeliveryInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Payment Preference */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>3. Payment Preference</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'Cash on Delivery', desc: 'Pay cash upon food delivery' },
                { id: 'UPI on Delivery', desc: 'GooglePay / PhonePe / Paytm on delivery' },
                { id: 'Pay on WhatsApp', desc: 'Receive UPI QR code on WhatsApp chat' },
              ].map(opt => {
                const isSelected = paymentPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentPreference(opt.id as PaymentPreference)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.id}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Summary & Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-400" />
                <span>Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              </span>
              <span className="text-orange-400 font-extrabold text-sm">{formatINR(pricing.finalTotal)}</span>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-1 text-xs text-slate-400 pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate max-w-[280px]">
                    {item.quantity}x {item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}
                  </span>
                  <span className="text-slate-200">{formatINR(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800/80 pt-2 flex justify-between text-xs text-slate-300">
              <span>Delivery Charge:</span>
              <span>{pricing.isFreeDelivery ? <strong className="text-emerald-400">FREE</strong> : formatINR(pricing.deliveryCharge)}</span>
            </div>
          </div>

          {/* WhatsApp Direct Dispatch Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              When you submit, your complete order will be saved in our system and opened directly in WhatsApp with <strong>Moonlight Kitchen (7666445477)</strong>. Please tap <strong>Send</strong> in WhatsApp to confirm!
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-emerald-950 transition-all uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Preparing Order...</span>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Place Order via WhatsApp — {formatINR(pricing.finalTotal)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
