'use client';

import React, { useState, useEffect } from 'react';
import { X, Boxes, Plus, Minus, RefreshCw, Save } from 'lucide-react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface StockAdjustmentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (data: {
    productId: string;
    adjustmentType: 'Stock In' | 'Stock Out' | 'Correction';
    quantityChange: number;
    reason: string;
    adjustedBy: string;
  }) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  isOpen,
  onClose,
  onAdjust,
}) => {
  const { currentUser } = useAuth();
  const [adjustmentType, setAdjustmentType] = useState<'Stock In' | 'Stock Out' | 'Correction'>('Stock In');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState('Stock replenishment / Physical shelf count');

  useEffect(() => {
    if (product) {
      setQuantity(10);
      setReason('Stock replenishment / Physical shelf count');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const currentQty = product.stockQuantity;
  let newQty = currentQty;

  if (adjustmentType === 'Stock In') {
    newQty = currentQty + Math.abs(quantity);
  } else if (adjustmentType === 'Stock Out') {
    newQty = Math.max(0, currentQty - Math.abs(quantity));
  } else if (adjustmentType === 'Correction') {
    newQty = Math.max(0, quantity);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdjust({
      productId: product.id,
      adjustmentType,
      quantityChange: quantity,
      reason,
      adjustedBy: currentUser?.name || 'Inventory Manager',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5" />
            <h3 className="text-sm font-bold">Stock Adjustment Operation</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Target Product:</span>
            <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">{product.name}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>Current Stock: <strong>{currentQty} {product.unit}</strong></span>
              <span>SKU: {product.sku}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('Stock In')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  adjustmentType === 'Stock In'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Stock In (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('Stock Out')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  adjustmentType === 'Stock Out'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Stock Out (-)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('Correction')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  adjustmentType === 'Correction'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Set Exact</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {adjustmentType === 'Correction' ? 'Exact New Quantity' : 'Quantity Change'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Adjustment *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Physical inventory audit / Damaged item write-off"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* New Stock Preview */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs">
            <span className="text-amber-800 dark:text-amber-300 font-medium">Resulting Stock Quantity:</span>
            <span className="font-extrabold text-sm text-amber-700 dark:text-amber-200">
              {newQty} {product.unit}
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
              className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
