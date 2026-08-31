'use client';

import React from 'react';
import { X, Truck, ShoppingBag, Plus, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Supplier, Product } from '@/types';
import { formatBDT } from '@/lib/utils';

interface SupplierProductsDrawerProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onQuickOrder: (supplier: Supplier) => void;
}

export const SupplierProductsDrawer: React.FC<SupplierProductsDrawerProps> = ({
  supplier,
  isOpen,
  onClose,
  products,
  onQuickOrder,
}) => {
  if (!isOpen || !supplier) return null;

  const suppliedProducts = products.filter(p => p.supplierId === supplier.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">{supplier.name}</h3>
              <p className="text-xs text-blue-100">Supplier Catalog & Financial Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Supplier Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Person</span>
              <span className="font-semibold text-slate-900 dark:text-white">{supplier.contactPerson}</span>
              <div className="text-slate-500 text-[11px] mt-0.5">{supplier.phone}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Orders</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatBDT(supplier.totalPurchased)}</span>
              <div className="text-emerald-600 text-[11px] mt-0.5">Paid: {formatBDT(supplier.totalPaid)}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Due Balance</span>
              <span className={`text-sm font-black ${supplier.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatBDT(supplier.totalDue)}
              </span>
            </div>
          </div>

          {/* Supplied Products List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>Products Supplied by {supplier.name} ({suppliedProducts.length})</span>
              </h4>

              <button
                onClick={() => {
                  onClose();
                  onQuickOrder(supplier);
                }}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Purchase Order</span>
              </button>
            </div>

            {suppliedProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                No active products currently linked to this supplier.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/60 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3 text-right">Supplier Unit Cost</th>
                      <th className="py-2.5 px-3 text-right">Store Selling Price</th>
                      <th className="py-2.5 px-3 text-center">In Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {suppliedProducts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {p.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                          {p.sku}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatBDT(p.purchasePrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-blue-600 font-semibold">
                          {formatBDT(p.sellingPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300">
                          {p.stockQuantity} {p.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
