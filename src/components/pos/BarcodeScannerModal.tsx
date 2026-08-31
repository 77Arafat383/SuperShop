'use client';

import React, { useState } from 'react';
import { X, Barcode, Scan, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Product } from '@/types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onScanProduct: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onScanProduct,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = barcodeInput.trim().toLowerCase();
    const found = products.find(p => p.barcode.toLowerCase() === clean || p.sku.toLowerCase() === clean);

    if (found) {
      onScanProduct(found);
      setBarcodeInput('');
      onClose();
    } else {
      setError(`No product found with barcode "${barcodeInput}"`);
    }
  };

  const handleQuickPreset = (prod: Product) => {
    onScanProduct(prod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            <h3 className="text-sm font-bold">Barcode Scanner Terminal</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Laser Scanner Visual Simulation */}
        <div className="p-6 text-center space-y-4">
          <div className="relative w-48 h-28 mx-auto bg-slate-950 rounded-2xl border-2 border-dashed border-blue-500/60 flex items-center justify-center overflow-hidden">
            <Barcode className="w-28 h-16 text-slate-600" />
            {/* Animated Laser beam */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
          </div>

          <form onSubmit={handleScanSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Scan or Type Product Barcode
              </label>
              <input
                type="text"
                autoFocus
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="e.g. 894110000101"
                className="w-full text-center tracking-widest font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Add Scanned Product to Cart
            </button>
          </form>

          {/* Quick preset barcodes */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Barcode Test Samples:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {products.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleQuickPreset(p)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700 transition"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                    <span className="block text-[10px] font-mono text-slate-400">{p.barcode}</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600">Scan</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
