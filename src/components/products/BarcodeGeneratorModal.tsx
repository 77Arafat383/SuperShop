'use client';

import React, { useState } from 'react';
import { X, Printer, Barcode as BarcodeIcon, Tag, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatBDT } from '@/lib/utils';

interface BarcodeGeneratorModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [labelCount, setLabelCount] = useState<number>(8);

  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-8">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <BarcodeIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">Print Product Barcode Labels</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Stickers to Print:</span>
            <input
              type="number"
              min="1"
              max="24"
              value={labelCount}
              onChange={(e) => setLabelCount(Math.min(24, Math.max(1, Number(e.target.value))))}
              className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
            />
          </div>

          <button
            onClick={handlePrint}
            className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>

        {/* Printable Barcode Sheet */}
        <div className="p-6 bg-white text-black printable-receipt-area">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: labelCount }).map((_, index) => (
              <div
                key={index}
                className="p-3 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center text-center space-y-1 font-mono"
              >
                <div className="text-[11px] font-bold truncate max-w-[200px] leading-tight">
                  {product.name}
                </div>
                <div className="text-sm font-black text-black">
                  MRP: {formatBDT(product.sellingPrice)}
                  {product.discount > 0 && (
                    <span className="text-[10px] text-red-600 block">(-৳{product.discount} OFF)</span>
                  )}
                </div>

                {/* Visual Barcode Graphic */}
                <div className="h-10 w-44 bg-gray-100 flex items-center justify-center border border-gray-300 text-[10px] tracking-widest my-1 font-bold">
                  || | ||| || |||| | ||
                </div>

                <div className="text-[10px] tracking-widest text-gray-700 font-mono">
                  {product.barcode}
                </div>
                <div className="text-[9px] text-gray-400">NSTU RBMS STORE</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
