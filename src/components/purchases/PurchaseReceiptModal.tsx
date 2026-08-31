'use client';

import React from 'react';
import { X, Printer, CheckCircle2, Building2, Truck, FileText, ArrowRight } from 'lucide-react';
import { PurchaseOrder, PurchasePaymentRecord, Supplier } from '@/types';
import { formatBDT, formatDate } from '@/lib/utils';

interface PurchaseReceiptModalProps {
  po: PurchaseOrder | null;
  receipt: PurchasePaymentRecord | null;
  supplier?: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseReceiptModal: React.FC<PurchaseReceiptModalProps> = ({
  po,
  receipt,
  supplier,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !po || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold">Supplier Payment Money Receipt</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 bg-white text-black printable-receipt-area font-sans space-y-4 text-xs">
          {/* Header Store & Supplier */}
          <div className="flex justify-between items-start border-b pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900">NSTU SUPER MART</h2>
              <p className="text-[11px] text-gray-600">
                Department of CSTE, NSTU Campus<br />
                Accounts & Procurement Wing
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-gray-500">Receipt No:</span>
              <div className="text-sm font-black text-blue-600">{receipt.receiptNumber}</div>
              <div className="text-[10px] text-gray-500">{formatDate(receipt.paymentDate)}</div>
            </div>
          </div>

          {/* Supplier Info & PO Details */}
          <div className="bg-gray-50 p-3 rounded-xl border grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Supplier:</span>
              <div className="font-bold text-slate-900">{po.supplierName}</div>
              <div className="text-gray-600">{po.supplierPhone}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Purchase Order:</span>
              <div className="font-bold text-slate-900">{po.poNumber}</div>
              <div className="text-gray-600">Recorded By: {receipt.recordedBy}</div>
            </div>
          </div>

          {/* Payment Amount Callout */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-800">Installment Paid:</span>
              <div className="text-xl font-black text-emerald-700">
                {formatBDT(receipt.amountPaid)}
              </div>
            </div>
            <div className="text-right text-[11px]">
              <span className="text-gray-600 block">Method: <strong>{receipt.paymentMethod}</strong></span>
              <span className="text-gray-600 font-mono">Ref: {receipt.transactionRef}</span>
            </div>
          </div>

          {/* Due Status Overview */}
          <div className="border rounded-xl p-3 space-y-1.5 bg-gray-50/50">
            <div className="flex justify-between text-gray-600">
              <span>Order Total Amount:</span>
              <span className="font-semibold">{formatBDT(po.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Previous Due Before This Payment:</span>
              <span>{formatBDT(receipt.previousDue)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Amount Paid Now:</span>
              <span>- {formatBDT(receipt.amountPaid)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t font-black text-slate-900">
              <span>Updated Remaining Due:</span>
              <span className={receipt.remainingDue > 0 ? 'text-red-600' : 'text-emerald-600'}>
                {formatBDT(receipt.remainingDue)}
              </span>
            </div>
          </div>

          {/* Previous Payment History for this PO */}
          {po.paymentHistory.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Complete Payment History for PO #{po.poNumber}:
              </span>
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-gray-100 font-bold border-y">
                    <th className="py-1 px-1.5">Date</th>
                    <th className="py-1 px-1.5">Receipt #</th>
                    <th className="py-1 px-1.5">Method</th>
                    <th className="py-1 px-1.5 text-right">Amount</th>
                    <th className="py-1 px-1.5 text-right">Remaining Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {po.paymentHistory.map((hist) => (
                    <tr key={hist.id}>
                      <td className="py-1 px-1.5">{formatDate(hist.paymentDate)}</td>
                      <td className="py-1 px-1.5 font-mono">{hist.receiptNumber}</td>
                      <td className="py-1 px-1.5">{hist.paymentMethod}</td>
                      <td className="py-1 px-1.5 text-right font-bold">৳{hist.amountPaid}</td>
                      <td className="py-1 px-1.5 text-right">৳{hist.remainingDue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-4 border-t text-center text-[10px] text-gray-400">
            System generated transaction receipt • Valid without physical seal
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
          <button
            onClick={handlePrint}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Payment Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
