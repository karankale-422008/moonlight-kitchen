import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  User, 
  MessageSquare, 
  CreditCard, 
  AlertCircle,
  FileText
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

    if (items.length === 0) {
      setValidationError('Your basket is empty. Please select food items first.');
      return;
    }

    if (!fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

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

      if (profile) {
        await updateProfile({ fullName: fullName.trim(), phone: cleanPhone });
        if (!activeAddress) {
          await addAddress(addressObj);
        }
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Checkout &amp; Delivery Details
            </h2>
            <p className="text-xs text-slate-500">
              Complete your address to place order via WhatsApp
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Customer Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-orange-600" />
              <span>1. Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  WhatsApp Mobile Number (10 Digits) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-r-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>2. Delivery Address</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Flat / House / Building *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Sunshine Apts"
                  value={houseNo}
                  onChange={e => setHouseNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Street / Road *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MG Road, Near Central Mall"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Area / Locality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shivaji Nagar / Sector 14"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite City Hospital"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ring bell, leave with security..."
                value={deliveryInstructions}
                onChange={e => setDeliveryInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Payment Preference */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span>3. Payment Method</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'Cash on Delivery', desc: 'Pay cash upon delivery' },
                { id: 'UPI on Delivery', desc: 'GPay / PhonePe / QR on delivery' },
                { id: 'Pay on WhatsApp', desc: 'Receive QR link on WhatsApp' },
              ].map(opt => {
                const isSelected = paymentPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentPreference(opt.id as PaymentPreference)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.id}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Summary & Pricing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-600" />
                <span>Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              </span>
              <span className="text-orange-600 font-extrabold text-sm">{formatINR(pricing.finalTotal)}</span>
            </div>

            <div className="max-h-28 overflow-y-auto space-y-1 text-xs text-slate-600 pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate max-w-[280px]">
                    {item.quantity}x {item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}
                  </span>
                  <span className="text-slate-900 font-medium">{formatINR(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between text-xs text-slate-700 font-medium">
              <span>Delivery Fee:</span>
              <span>{pricing.isFreeDelivery ? <strong className="text-emerald-700">FREE</strong> : formatINR(pricing.deliveryCharge)}</span>
            </div>
          </div>

          {/* WhatsApp Direct Dispatch Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              When submitted, your order will be recorded in our system and opened directly in WhatsApp with <strong>Moonlight Kitchen (7666445477)</strong>. Tap <strong>Send</strong> in WhatsApp to dispatch!
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all uppercase tracking-wider disabled:opacity-50"
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
