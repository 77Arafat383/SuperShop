'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, Plus, Search, CheckCircle, AlertTriangle, 
  Calendar, ShoppingBag, ArrowRight, Save 
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatBDT, formatDate } from '@/lib/utils';

export default function ReturnsPage() {
  const { returns, sales, products, processReturn } = useData();
  const { currentUser } = useAuth();

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(sales[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Customer changed mind / Defective seal');

  const selectedSale = sales.find(s => s.id === selectedSaleId);
  const selectedSaleItem = selectedSale?.items.find(item => item.productId === selectedProductId);
  const maxReturnQuantity = selectedSaleItem?.quantity ?? 1;

  React.useEffect(() => {
    if (!selectedSaleId && sales.length > 0) {
      setSelectedSaleId(sales[0].id);
    }
  }, [sales, selectedSaleId]);

  React.useEffect(() => {
    if (selectedSale && selectedSale.items.length > 0) {
      setSelectedProductId(selectedSale.items[0].productId);
    }
  }, [selectedSale]);

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale || !selectedProductId) {
      alert('Please select a valid sale and product to return');
      return;
    }

    if (quantity > maxReturnQuantity) {
      alert(`Return quantity cannot exceed purchased quantity (${maxReturnQuantity}).`);
      return;
    }

    processReturn({
      saleId: selectedSale.id,
      invoiceNumber: selectedSale.invoiceNumber,
      productId: selectedProductId,
      quantity: Number(quantity),
      reason,
      processedBy: currentUser?.name || 'Cashier',
    });

    setIsReturnModalOpen(false);
    setQuantity(1);
    setReason('Customer changed mind / Defective seal');
  };

  const totalRefunded = returns.reduce((acc, r) => acc + (r.status === 'Approved' ? r.refundAmount : 0), 0);
  const totalUnitsReturned = returns.reduce((acc, r) => acc + (r.status === 'Approved' ? r.quantity : 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Product Returns & Customer Refunds
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Process customer merchandise returns, issue instant cash/MFS refunds, and automatically replenish stock.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Items Returned
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalUnitsReturned} Units
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Refund Payouts
            </span>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {formatBDT(totalRefunded)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Return Incidents
            </span>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {returns.length} Cases
            </div>
          </div>
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Process Return</span>
          </button>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Customer Return Log & Restocking
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Return # & Date</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Product Returned</th>
                <th className="py-3 px-4 text-center">Qty Returned</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Processed By</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {ret.returnNumber}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatDate(ret.returnDate)}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-blue-600">
                    {ret.invoiceNumber}
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {ret.productName}
                  </td>

                  <td className="py-3 px-4 text-center font-bold text-purple-600">
                    {ret.quantity} pcs
                  </td>

                  <td className="py-3 px-4 text-right font-black text-rose-600">
                    {formatBDT(ret.refundAmount)}
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px] max-w-[200px] truncate" title={ret.reason}>
                    {ret.reason}
                  </td>

                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {ret.processedBy}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {ret.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Return Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-sm font-bold">Process Customer Product Return</h3>
              </div>
              <button onClick={() => setIsReturnModalOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Original Sale Invoice
                </label>
                <select
                  value={selectedSaleId}
                  onChange={(e) => setSelectedSaleId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  {sales.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.invoiceNumber} — {s.customerName} ({formatBDT(s.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedSale && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Product to Return
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    {selectedSale.items.map(item => (
                      <option key={item.productId} value={item.productId}>
                        {item.productName} (Bought: {item.quantity} pcs @ ৳{item.unitPrice})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Return Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxReturnQuantity}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(maxReturnQuantity, Math.max(1, Number(e.target.value))))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                />
                {selectedSaleItem && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Purchased quantity: {maxReturnQuantity} pcs
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Return *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Expired seal / Wrong size / Quality issue"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Authorize Return & Refund</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
