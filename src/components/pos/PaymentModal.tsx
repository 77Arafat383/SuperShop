'use client';

import React, { useState } from 'react';
import { 
  X, Banknote, Smartphone, CreditCard, Layers, 
  CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, KeyRound, AlertCircle 
} from 'lucide-react';
import { PaymentMethod, PaymentDetails } from '@/types';
import { formatBDT } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  customerPhone?: string;
  onCompleteSale: (method: PaymentMethod, details: PaymentDetails) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  customerPhone = '',
  onCompleteSale,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash');

  // Cash State
  const [cashTendered, setCashTendered] = useState<number>(Math.ceil(totalAmount));
  const changeGiven = Math.max(0, cashTendered - totalAmount);

  // Mobile Banking State (bKash / Nagad)
  const [mobileNumber, setMobileNumber] = useState(customerPhone || '01712345678');
  const [mfsStep, setMfsStep] = useState<'number' | 'otp' | 'pin'>('number');
  const [otpCode, setOtpCode] = useState('682914');
  const [pinCode, setPinCode] = useState('');
  const [trxId, setTrxId] = useState('');

  // Card State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('MEMBER CLIENT');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');

  // Split State
  const [splitCash, setSplitCash] = useState<number>(Math.floor(totalAmount / 2));
  const splitDigital = Math.max(0, totalAmount - splitCash);
  const [splitDigitalMethod, setSplitDigitalMethod] = useState<'bKash' | 'Nagad' | 'Card'>('bKash');

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleQuickCash = (amount: number) => {
    setCashTendered(amount);
  };

  const handleCashSubmit = () => {
    if (cashTendered < totalAmount) {
      alert(`Tendered amount (৳${cashTendered}) is less than total amount (৳${totalAmount})`);
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onCompleteSale('Cash', {
        method: 'Cash',
        cashTendered,
        changeGiven,
      });
      setIsProcessing(false);
    }, 400);
  };

  const handleMfsSubmit = () => {
    if (mfsStep === 'number') {
      if (!mobileNumber || mobileNumber.length < 11) {
        alert('Please enter a valid 11-digit mobile number');
        return;
      }
      setMfsStep('otp');
      return;
    }

    if (mfsStep === 'otp') {
      if (!otpCode || otpCode.length < 4) {
        alert('Please enter the 6-digit SMS OTP verification code');
        return;
      }
      setMfsStep('pin');
      return;
    }

    if (mfsStep === 'pin') {
      if (!pinCode || pinCode.length < 4) {
        alert('Please enter your 5-digit secret wallet PIN');
        return;
      }

      setIsProcessing(true);
      const generatedTrx = `${selectedMethod === 'bKash' ? 'BK' : 'NG'}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setTrxId(generatedTrx);

      setTimeout(() => {
        onCompleteSale(selectedMethod, {
          method: selectedMethod,
          mobileNumber,
          trxId: generatedTrx,
        });
        setIsProcessing(false);
      }, 600);
    }
  };

  const handleCardSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onCompleteSale('Card', {
        method: 'Card',
        cardLast4: '4242',
        cardType: 'Visa International',
        authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      setIsProcessing(false);
    }, 600);
  };

  const handleSplitSubmit = () => {
    setIsProcessing(true);
    const generatedTrx = `${splitDigitalMethod === 'bKash' ? 'BK' : 'NG'}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    setTimeout(() => {
      onCompleteSale('Split', {
        method: 'Split',
        splitCash,
        splitDigital,
        splitDigitalMethod,
        trxId: generatedTrx,
        cashTendered: splitCash,
        changeGiven: 0,
      });
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
              POS Payment Checkout
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">
              Pay Total: {formatBDT(totalAmount)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          <button
            onClick={() => { setSelectedMethod('Cash'); }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              selectedMethod === 'Cash'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Cash</span>
          </button>

          <button
            onClick={() => { setSelectedMethod('bKash'); setMfsStep('number'); }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              selectedMethod === 'bKash'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>bKash</span>
          </button>

          <button
            onClick={() => { setSelectedMethod('Nagad'); setMfsStep('number'); }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              selectedMethod === 'Nagad'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Nagad</span>
          </button>

          <button
            onClick={() => { setSelectedMethod('Card'); }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              selectedMethod === 'Card'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Card</span>
          </button>

          <button
            onClick={() => { setSelectedMethod('Split'); }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
              selectedMethod === 'Split'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Split</span>
          </button>
        </div>

        {/* Method Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* 1. CASH FLOW */}
          {selectedMethod === 'Cash' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Amount Tendered (Cash Given by Customer)
                </label>
                <div className="relative">
                  <span className="text-xl font-bold text-slate-400 absolute left-4 top-1/2 -translate-y-1/2">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={totalAmount}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-2">
                {[
                  Math.ceil(totalAmount),
                  Math.ceil(totalAmount / 50) * 50,
                  Math.ceil(totalAmount / 100) * 100,
                  Math.ceil(totalAmount / 500) * 500,
                  1000,
                  2000
                ].filter((v, i, a) => v >= totalAmount && a.indexOf(v) === i).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickCash(amt)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              {/* Change Calculation Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Change to Return:
                  </span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatBDT(changeGiven)}
                  </div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
              </div>

              <button
                type="button"
                disabled={isProcessing || cashTendered < totalAmount}
                onClick={handleCashSubmit}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>{isProcessing ? 'Processing Cash & Printing Receipt...' : 'Confirm Cash Payment & Print Receipt'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2 & 3. bKash / Nagad INTERACTIVE FLOW */}
          {(selectedMethod === 'bKash' || selectedMethod === 'Nagad') && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-4 rounded-2xl text-white ${
                selectedMethod === 'bKash' 
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600' 
                  : 'bg-gradient-to-r from-orange-600 to-amber-600'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                    {selectedMethod} Payment Gateway (Bangladesh)
                  </span>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-lg font-black">
                  Amount: {formatBDT(totalAmount)}
                </div>
              </div>

              {mfsStep === 'number' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Customer {selectedMethod} Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    A secure 6-digit OTP verification code will be sent to the customer&apos;s handset.
                  </p>
                  <button
                    onClick={handleMfsSubmit}
                    className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition ${
                      selectedMethod === 'bKash' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    Send OTP Verification
                  </button>
                </div>
              )}

              {mfsStep === 'otp' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>OTP sent to {mobileNumber}. (Demo OTP prefilled: 682914)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full tracking-widest text-center text-xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleMfsSubmit}
                    className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition ${
                      selectedMethod === 'bKash' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {mfsStep === 'pin' && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Enter Customer {selectedMethod} 5-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={5}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="•••••"
                      className="w-full tracking-widest text-center text-xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Enter any 5-digit PIN (e.g. 12345) to complete payment
                  </p>
                  <button
                    disabled={isProcessing}
                    onClick={handleMfsSubmit}
                    className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 ${
                      selectedMethod === 'bKash' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    {isProcessing ? 'Verifying with Bangladesh Bank MFS...' : `Confirm & Authorize ${selectedMethod} Payment`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. CARD FLOW */}
          {selectedMethod === 'Card' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white border border-indigo-700/50 shadow-xl space-y-3">
                <div className="flex justify-between items-center text-xs text-indigo-200">
                  <span>Contactless POS Card Reader</span>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-lg font-mono tracking-widest">{cardNumber}</div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{cardHolder}</span>
                  <span>EXP: {cardExpiry}</span>
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleCardSubmit}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>{isProcessing ? 'Authorizing Card...' : `Charge Card ${formatBDT(totalAmount)}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 5. SPLIT FLOW */}
          {selectedMethod === 'Split' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Cash Portion (৳)
                  </label>
                  <input
                    type="number"
                    value={splitCash}
                    max={totalAmount}
                    onChange={(e) => setSplitCash(Math.min(totalAmount, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Digital Method
                  </label>
                  <select
                    value={splitDigitalMethod}
                    onChange={(e) => setSplitDigitalMethod(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs space-y-1 text-purple-900 dark:text-purple-200">
                <div className="flex justify-between">
                  <span>Cash Payment:</span>
                  <span className="font-bold">{formatBDT(splitCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Digital ({splitDigitalMethod}) Balance:</span>
                  <span className="font-bold">{formatBDT(splitDigital)}</span>
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleSplitSubmit}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>{isProcessing ? 'Processing Split Transaction...' : 'Confirm Split Payment & Print Receipt'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
