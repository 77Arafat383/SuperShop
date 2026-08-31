'use client';

import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PurchaseOrder, PurchasePaymentRecord } from '@/types';
import { formatBDT } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface SupplierPaymentModalProps {
  po: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onPayDue: (data: {
    purchaseId: string;
    amountPaid: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer';
    transactionRef: string;
    notes?: string;
    recordedBy: string;
  }) => void;
}

export const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = ({
  po,
  isOpen,
  onClose,
  onPayDue,
}) => {
  const { currentUser } = useAuth();
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer'>('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('Supplier due clearance payment');

  React.useEffect(() => {
    if (po) {
      setAmountToPay(po.dueAmount);
      setTransactionRef(`TRX-${Math.floor(100000 + Math.random() * 900000)}`);
      setNotes(`Installment for PO #${po.poNumber}`);
    }
  }, [po, isOpen]);

  if (!isOpen || !po) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountToPay <= 0) {
      alert('Please enter a valid payment amount greater than 0');
      return;
    }
    if (amountToPay > po.dueAmount) {
      alert(`Amount cannot exceed current due balance of ৳${po.dueAmount}`);
      return;
    }

    onPayDue({
      purchaseId: po.id,
      amountPaid: Number(amountToPay),
      paymentMethod,
      transactionRef: transactionRef || `REF-${Date.now().toString().slice(-6)}`,
      notes,
      recordedBy: currentUser?.name || 'Purchase Manager',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <h3 className="text-sm font-bold">Pay Supplier Due Balance</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Supplier:</span>
              <span className="font-bold text-slate-900 dark:text-white">{po.supplierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PO Number:</span>
              <span className="font-mono">{po.poNumber}</span>
            </div>
            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Current Due Balance:</span>
              <span>{formatBDT(po.dueAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Amount (৳) *
            </label>
            <input
              type="number"
              min="1"
              max={po.dueAmount}
              required
              value={amountToPay}
              onChange={(e) => setAmountToPay(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-base font-extrabold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Cash">Cash on Counter</option>
              <option value="bKash">bKash Merchant</option>
              <option value="Nagad">Nagad Direct</option>
              <option value="Bank Transfer">Bank Transfer / EFT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Transaction / Cheque Reference #
            </label>
            <input
              type="text"
              required
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via City Bank transfer"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs flex justify-between">
            <span className="text-emerald-800 dark:text-emerald-300 font-medium">New Remaining Due:</span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
              {formatBDT(Math.max(0, po.dueAmount - amountToPay))}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Confirm Payment & Print Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
