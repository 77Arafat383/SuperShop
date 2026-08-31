'use client';

import React from 'react';
import { X, History, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, User } from 'lucide-react';
import { StockAdjustment } from '@/types';
import { formatDate } from '@/lib/utils';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustments: StockAdjustment[];
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  onClose,
  adjustments,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold">Stock Movement & Adjustment Audit Log</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex-1 max-h-[70vh] overflow-y-auto">
          {adjustments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No stock movements recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-center">Change</th>
                    <th className="py-2.5 px-3 text-center">Result Stock</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Adjusted By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adjustments.map((adj) => {
                    const isIncrease = adj.quantityChange > 0;

                    return (
                      <tr key={adj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {formatDate(adj.date)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {adj.productName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            adj.adjustmentType === 'Stock In'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : adj.adjustmentType === 'Stock Out'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {adj.adjustmentType}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 text-center font-bold ${isIncrease ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isIncrease ? `+${adj.quantityChange}` : adj.quantityChange}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                          {adj.quantityAfter}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={adj.reason}>
                          {adj.reason}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {adj.adjustedBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
