'use client';

import React, { useState } from 'react';
import { 
  Boxes, Search, SlidersHorizontal, AlertTriangle, CheckCircle, 
  History, ArrowUpDown, Filter, Sparkles 
} from 'lucide-react';
import { Product } from '@/types';
import { formatBDT } from '@/lib/utils';

interface StockTableProps {
  products: Product[];
  onOpenAdjustment: (product: Product) => void;
  onOpenHistory: () => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  products,
  onOpenAdjustment,
  onOpenHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'All' | 'LowStock' | 'OutOfStock' | 'Healthy'>('All');

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);

    let matchesStatus = true;
    if (stockStatusFilter === 'LowStock') {
      matchesStatus = p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel;
    } else if (stockStatusFilter === 'OutOfStock') {
      matchesStatus = p.stockQuantity <= 0;
    } else if (stockStatusFilter === 'Healthy') {
      matchesStatus = p.stockQuantity > p.minStockLevel;
    }

    return matchesSearch && matchesStatus;
  });

  const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length;
  const outOfStockCount = products.filter(p => p.stockQuantity <= 0).length;

  return (
    <div className="space-y-4">
      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total SKUs Monitored
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {products.length} Items
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
              {lowStockCount} Items
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              {outOfStockCount} Items
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter inventory stocks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Stock Statuses</option>
            <option value="Healthy">Healthy In Stock</option>
            <option value="LowStock">Low Stock Alert</option>
            <option value="OutOfStock">Out of Stock</option>
          </select>

          <button
            onClick={onOpenHistory}
            className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ml-auto md:ml-0"
          >
            <History className="w-4 h-4 text-amber-500" />
            <span>Audit History</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4 text-center">Current Quantity</th>
                <th className="py-3 px-4 text-center">Stock Status</th>
                <th className="py-3 px-4 text-right">Asset Valuation</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredProducts.map((p) => {
                const isOut = p.stockQuantity <= 0;
                const isLow = p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel;
                const assetValue = p.stockQuantity * p.purchasePrice;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        SKU: {p.sku} • Barcode: {p.barcode}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {p.categoryName}
                    </td>

                    <td className="py-3 px-4 text-center text-slate-500 font-medium">
                      {p.minStockLevel} {p.unit}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {p.stockQuantity}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">{p.unit}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isOut
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : isLow
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {isLow && <AlertTriangle className="w-3 h-3" />}
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {formatBDT(assetValue)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenAdjustment(p)}
                        className="py-1.5 px-3 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800 transition flex items-center gap-1 ml-auto"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
