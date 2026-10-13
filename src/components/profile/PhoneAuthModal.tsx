import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 animate-in zoom-in-95 duration-200 text-gray-100"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">
            {step === 'phone' ? 'Verify Mobile Number' : 'Enter Verification Code'}
          </h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            {step === 'phone'
              ? 'Access saved delivery addresses & orders with ease.'
              : `A 6-digit code was sent to +91 ${phone}`}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Demo Verification Mode:</strong> Use code <strong className="text-amber-300 font-mono text-sm underline">123456</strong>
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-gray-700 bg-gray-800 text-gray-300 text-sm font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-r-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || phone.length !== 10}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg shadow-amber-900/30"
            >
              {isLoading ? (
                <span>Sending Code...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="1 2 3 4 5 6"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-lg font-mono text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg shadow-amber-900/30"
            >
              {isLoading ? 'Verifying...' : 'Verify & Log In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-300 pt-1"
            >
              Edit phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
