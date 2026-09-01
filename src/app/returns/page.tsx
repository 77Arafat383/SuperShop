'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, Plus, Search, CheckCircle, AlertTriangle, 
  Calendar, ShoppingBag, ArrowRight, Save, Check, X, Clock
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatBDT, formatDate } from '@/lib/utils';

export default function ReturnsPage() {
  const { returns, sales, products, processReturn, approveReturn, rejectReturn } = useData();
  const { currentUser } = useAuth();

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(sales[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Customer changed mind / Defective seal');

  const isManagerOrAdmin = ['Administrator', 'Inventory Manager', 'Purchase Manager'].includes(currentUser?.role || '');

  const selectedSale = sales.find(s => s.id === selectedSaleId);
  const selectedSaleItem = selectedSale?.items.find(item => item.productId === selectedProductId);

  const alreadyReturnedQty = returns
    .filter(r => r.saleId === selectedSaleId && r.productId === selectedProductId && r.status !== 'Rejected')
    .reduce((sum, r) => sum + r.quantity, 0);

  const purchasedQuantity = selectedSaleItem?.quantity ?? 0;
  const maxReturnQuantity = Math.max(0, purchasedQuantity - alreadyReturnedQty);

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

  React.useEffect(() => {
    if (maxReturnQuantity > 0) {
      setQuantity(prev => Math.min(prev > 0 ? prev : 1, maxReturnQuantity));
    } else {
      setQuantity(0);
    }
  }, [selectedSaleId, selectedProductId, maxReturnQuantity]);

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale || !selectedProductId) {
      alert('Please select a valid sale and product to return');
      return;
    }

    if (maxReturnQuantity <= 0) {
      alert('All purchased units for this item have already been returned or requested.');
      return;
    }

    if (quantity > maxReturnQuantity) {
      alert(`Return quantity cannot exceed available returnable quantity (${maxReturnQuantity} pcs).`);
      return;
    }

    if (quantity < 1) {
      alert('Return quantity must be at least 1.');
      return;
    }

    const initialStatus: 'Approved' | 'Pending' = isManagerOrAdmin ? 'Approved' : 'Pending';

    processReturn({
      saleId: selectedSale.id,
      invoiceNumber: selectedSale.invoiceNumber,
      productId: selectedProductId,
      quantity: Number(quantity),
      reason,
      processedBy: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Cashier',
      status: initialStatus,
    });

    setIsReturnModalOpen(false);
    setQuantity(1);
    setReason('Customer changed mind / Defective seal');

    if (initialStatus === 'Pending') {
      alert('Return request submitted successfully! Pending Inventory Manager approval.');
    } else {
      alert('Return authorized and stock replenished successfully!');
    }
  };

  const totalRefunded = returns.reduce((acc, r) => acc + (r.status === 'Approved' ? r.refundAmount : 0), 0);
  const totalUnitsReturned = returns.reduce((acc, r) => acc + (r.status === 'Approved' ? r.quantity : 0), 0);
  const pendingCount = returns.filter(r => r.status === 'Pending').length;

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

      {/* Pending Approval Banner for Managers */}
      {isManagerOrAdmin && pendingCount > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
            <span>
              Action Required: <strong>{pendingCount} return request{pendingCount > 1 ? 's' : ''}</strong> pending Inventory Manager approval.
            </span>
          </div>
        </div>
      )}

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
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5 flex items-center gap-2">
              <span>{returns.length} Cases</span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {pendingCount} Pending
                </span>
              )}
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
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
                <th className="py-3 px-4 text-center">Actions</th>
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
                    {ret.status === 'Approved' && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Approved
                      </span>
                    )}
                    {ret.status === 'Pending' && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                        Pending Approval
                      </span>
                    )}
                    {ret.status === 'Rejected' && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Declined
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {ret.status === 'Pending' && isManagerOrAdmin ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => approveReturn(ret.id, currentUser?.name || 'Inventory Manager')}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                          title="Approve Return & Replenish Stock"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectReturn(ret.id, currentUser?.name || 'Inventory Manager')}
                          className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                          title="Decline Return Request"
                        >
                          <X className="w-3 h-3" />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">-</span>
                    )}
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
                    {selectedSale.items.map(item => {
                      const itemAlreadyReturned = returns
                        .filter(r => r.saleId === selectedSale.id && r.productId === item.productId && r.status !== 'Rejected')
                        .reduce((sum, r) => sum + r.quantity, 0);
                      const itemMax = Math.max(0, item.quantity - itemAlreadyReturned);

                      return (
                        <option key={item.productId} value={item.productId}>
                          {item.productName} (Bought: {item.quantity} pcs | Returnable: {itemMax} pcs)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Return Quantity
                </label>
                <input
                  type="number"
                  min={maxReturnQuantity > 0 ? 1 : 0}
                  max={maxReturnQuantity}
                  required
                  disabled={maxReturnQuantity === 0}
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (maxReturnQuantity === 0) {
                      setQuantity(0);
                    } else {
                      setQuantity(Math.min(maxReturnQuantity, Math.max(1, val)));
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white disabled:opacity-50"
                />
                {selectedSaleItem && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Purchased: {purchasedQuantity} pcs
                    {alreadyReturnedQty > 0 && ` (Already returned/requested: ${alreadyReturnedQty} pcs)`}
                    {` • Max returnable: ${maxReturnQuantity} pcs`}
                  </p>
                )}
                {selectedSaleItem && maxReturnQuantity === 0 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>All purchased units for this item have already been returned or requested.</span>
                  </div>
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

              {!isManagerOrAdmin && (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-blue-700 dark:text-blue-300 text-[11px]">
                  <strong>Cashier Notice:</strong> Submitting this return will send a request to the Inventory Manager for approval before stock is replenished.
                </div>
              )}

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
                  disabled={maxReturnQuantity === 0}
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isManagerOrAdmin ? 'Authorize Return & Refund' : 'Submit Return Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
