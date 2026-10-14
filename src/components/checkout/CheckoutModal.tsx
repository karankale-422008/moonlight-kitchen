import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  User, 
  MessageSquare, 
  CreditCard, 
  AlertCircle,
  FileText,
  Truck
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
    if (profile) {
      if (profile.fullName) setFullName(profile.fullName);
      if (profile.phone) setPhone(profile.phone);
    }
    if (activeAddress) {
      setHouseNo(activeAddress.houseNo || '');
      setStreet(activeAddress.street || '');
      setArea(activeAddress.area || '');
      setCity(activeAddress.city || '');
      setPincode(activeAddress.pincode || '');
      setLandmark(activeAddress.landmark || '');
    }
  }, [profile, activeAddress, isOpen]);

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

    const orderAddress: CustomerAddress = {
      id: activeAddress?.id || `addr_${Date.now()}`,
      tag: 'Home',
      houseNo: houseNo.trim(),
      street: street.trim(),
      area: area.trim(),
      city: city.trim() || 'Delivery Zone',
      state: 'State',
      pincode: pincode.trim() || '000000',
      landmark: landmark.trim() || undefined,
      isDefault: true,
    };

    setIsSubmitting(true);
    try {
      if (!profile?.fullName || !profile?.phone) {
        await updateProfile({ fullName: fullName.trim(), phone: cleanPhone });
      }

      const order = await createOrder(
        items,
        pricing,
        orderAddress,
        paymentPreference,
        deliveryInstructions.trim() || undefined
      );

      if (order) {
        showToast('Order confirmed! Transmitting to kitchen...', 'success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 text-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/90">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Checkout &amp; Delivery Details
            </h2>
            <p className="text-xs text-gray-400">
              Complete your delivery address to place your order directly with the kitchen
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Customer Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-400" />
              <span>1. Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  WhatsApp Mobile Number (10 Digits) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-700 bg-gray-800 text-gray-300 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-r-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Details */}
          <div className="space-y-3 pt-3 border-t border-gray-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>2. Delivery Address</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Flat / House / Building *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Sunshine Apts"
                  value={houseNo}
                  onChange={e => setHouseNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Street / Road *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MG Road, Near Central Mall"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Area / Locality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shivaji Nagar / Sector 14"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite City Hospital"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ring bell, leave with security..."
                value={deliveryInstructions}
                onChange={e => setDeliveryInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Payment Preference */}
          <div className="space-y-3 pt-3 border-t border-gray-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
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
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.id}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Summary & Pricing */}
          <div className="p-4 rounded-2xl bg-gray-800/70 border border-gray-700 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-200">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              </span>
              <span className="text-amber-400 font-extrabold text-sm">{formatINR(pricing.finalTotal)}</span>
            </div>

            <div className="max-h-28 overflow-y-auto space-y-1 text-xs text-gray-400 pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate max-w-[280px]">
                    {item.quantity}x {item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}
                  </span>
                  <span className="text-gray-200 font-medium">{formatINR(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-2 flex justify-between text-xs text-gray-300 font-medium">
              <span>Delivery Fee:</span>
              <span>{pricing.isFreeDelivery ? <strong className="text-green-400">FREE</strong> : formatINR(pricing.deliveryCharge)}</span>
            </div>
          </div>

          {/* Live Kitchen Transmission Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              Your order is transmitted directly to <strong>Moonlight Kitchen's live order dashboard</strong>. Pay securely with Cash or UPI upon delivery.
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-gray-950 font-black text-sm shadow-xl shadow-amber-900/40 transition-all uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Order to Kitchen...</span>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Confirm &amp; Place Order — {formatINR(pricing.finalTotal)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
