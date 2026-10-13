import React, { useState } from 'react';
import { X, Phone, ShieldCheck, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const PhoneAuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, sendVerificationOtp, verifyOtp } = useCustomer();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await sendVerificationOtp(phone);
      if (res.success) {
        setDemoCode(res.demoOtp || null);
        setStep('otp');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const ok = await verifyOtp(phone, otp);
      if (ok) {
        setStep('phone');
        setOtp('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setStep('phone');
    setOtp('');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">
            {step === 'phone' ? 'Verify Mobile Number' : 'Enter Verification Code'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {step === 'phone'
              ? 'Access your saved addresses and order history securely.'
              : `A 6-digit code was sent to +91 ${phone}`}
          </p>
        </div>

        {/* Demo Mode Badge */}
        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Demo Verification Mode:</strong> Use code <strong className="text-amber-300 font-mono text-sm underline">123456</strong> to verify!
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Steps */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number (India)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-800 bg-slate-800 text-slate-300 text-sm font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-3 rounded-r-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || phone.replace(/\D/g, '').length !== 10}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Sending...' : 'Send Verification Code'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Enter 6-digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-orange-400 hover:underline"
                >
                  Change phone
                </button>
              </div>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-widest text-xl font-mono py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-orange-500"
              />
              {demoCode && (
                <p className="text-[11px] text-amber-400/90 text-center mt-1">
                  Demo OTP code: <strong>{demoCode}</strong>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.trim().length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
