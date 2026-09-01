'use client';

import React, { useState } from 'react';
import {
  X, Printer, Download, CheckCircle2, Building2,
  Barcode as BarcodeIcon, FileText, ShoppingBag, ArrowRight
} from 'lucide-react';
import { Sale } from '@/types';
import { formatBDT, formatDate } from '@/lib/utils';

interface ReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onNewSale: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  isOpen,
  onClose,
  onNewSale,
}) => {
  const [layoutMode, setLayoutMode] = useState<'thermal' | 'a4'>('thermal');

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Transaction Completed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
              <button
                onClick={() => setLayoutMode('thermal')}
                className={`px-2 py-1 rounded-md transition ${layoutMode === 'thermal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setLayoutMode('a4')}
                className={`px-2 py-1 rounded-md transition ${layoutMode === 'a4' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                A4 Invoice
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-white text-black printable-receipt-area font-sans">
          {/* Thermal Receipt Layout */}
          {layoutMode === 'thermal' ? (
            <div className="max-w-[340px] mx-auto text-center space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <h2 className="text-base font-black uppercase tracking-tight">
                  SALSETRACK
                </h2>
                <p className="text-[11px] text-gray-600 leading-tight">
                  CSTE Dept, NSTU Campus, Noakhali 3814<br />
                  BIN: 001928374-0101 • Helpline: +880 1812-345678
                </p>
              </div>

              <div className="border-t border-b border-dashed border-gray-400 py-1.5 text-[11px] text-left space-y-0.5">
                <div className="flex justify-between">
                  <span>INVOICE:</span>
                  <span className="font-bold">{sale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{formatDate(sale.saleDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER:</span>
                  <span>{sale.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span>{sale.customerName} {sale.customerPhone ? `(${sale.customerPhone})` : ''}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-dashed border-gray-400">
                    <th className="py-1">ITEM</th>
                    <th className="py-1 text-center">QTY</th>
                    <th className="py-1 text-right">PRICE</th>
                    <th className="py-1 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-gray-200">
                  {sale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 font-semibold leading-tight">
                        {item.productName}
                        {item.discount > 0 && <span className="block text-[9px] text-red-600 font-normal">(-৳{item.discount} disc)</span>}
                      </td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">৳{item.unitPrice}</td>
                      <td className="py-1 text-right font-bold">৳{item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>৳{sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.discountTotal > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>DISCOUNT:</span>
                    <span>-৳{sale.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GOVT VAT ({sale.taxRate}%):</span>
                  <span>৳{sale.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-b border-black py-1">
                  <span>GRAND TOTAL:</span>
                  <span>{formatBDT(sale.totalAmount)}</span>
                </div>

                {/* Payment Breakdown */}
                <div className="flex justify-between pt-1">
                  <span>PAYMENT ({sale.paymentMethod}):</span>
                  <span>৳{sale.paidAmount.toFixed(2)}</span>
                </div>

                {sale.changeAmount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>CHANGE RETURNED:</span>
                    <span>৳{sale.changeAmount.toFixed(2)}</span>
                  </div>
                )}

                {sale.paymentDetails.trxId && (
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>TRX ID:</span>
                    <span className="font-mono">{sale.paymentDetails.trxId}</span>
                  </div>
                )}
              </div>

              {/* Simulated Barcode */}
              <div className="pt-3 flex flex-col items-center space-y-1">
                <div className="h-10 w-48 flex items-center justify-center bg-gray-100 rounded border border-gray-300 font-mono text-[10px] tracking-widest">
                  * {sale.invoiceNumber} *
                </div>
                <span className="text-[10px] text-gray-500">Thank you for shopping with us!</span>
              </div>
            </div>
          ) : (
            /* A4 Full Tax Invoice Layout */
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">INVOICE</h1>
                  <p className="text-xs text-gray-500">Sales & Inventory Tracking System</p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Noakhali Science & Technology University<br />
                    Phone: +880 1812-345678 • VAT Reg: 001928374-0101
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-blue-600">{sale.invoiceNumber}</div>
                  <div className="text-xs text-gray-500">{formatDate(sale.saleDate)}</div>
                  <div className="mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded inline-block">
                    PAID IN FULL
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Bill To:</span>
                  <div className="font-bold text-slate-800">{sale.customerName}</div>
                  {sale.customerPhone && <div className="text-xs text-gray-600">Phone: {sale.customerPhone}</div>}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Cashier:</span>
                  <div className="font-bold text-slate-800">{sale.cashierName}</div>
                  <div className="text-xs text-gray-600">Method: {sale.paymentMethod}</div>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold border-y">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Item Description</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Price</th>
                    <th className="py-2 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 text-gray-500">{idx + 1}</td>
                      <td className="py-2 px-2 font-medium">{item.productName}</td>
                      <td className="py-2 px-2 text-center">{item.quantity}</td>
                      <td className="py-2 px-2 text-right">৳{item.unitPrice}</td>
                      <td className="py-2 px-2 text-right font-bold">৳{item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-right">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>৳{sale.subtotal.toFixed(2)}</span>
                  </div>
                  {sale.discountTotal > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-৳{sale.discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>VAT ({sale.taxRate}%):</span>
                    <span>৳{sale.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm border-t pt-1">
                    <span>Total Amount:</span>
                    <span>{formatBDT(sale.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt / PDF</span>
          </button>

          <button
            onClick={onNewSale}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition"
          >
            <span>Done</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
