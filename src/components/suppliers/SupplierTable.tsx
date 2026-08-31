'use client';

import React, { useState } from 'react';
import { 
  Truck, Plus, Search, Eye, Edit2, Trash2, Phone, Mail, 
  MapPin, CreditCard, ShoppingBag, ArrowRight 
} from 'lucide-react';
import { Supplier, Product } from '@/types';
import { formatBDT } from '@/lib/utils';

interface SupplierTableProps {
  suppliers: Supplier[];
  products: Product[];
  onAddSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onViewProducts: (supplier: Supplier) => void;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  products,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onViewProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suppliers by name, contact, phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={onAddSupplier}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition ml-auto sm:ml-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Supplier Name & Contact</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Payment Terms</th>
                <th className="py-3 px-4 text-right">Total Purchased</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4 text-right">Current Due Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.map((s) => {
                const suppliedCount = products.filter(p => p.supplierId === s.id).length;
                const isDue = s.totalDue > 0;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{s.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200 dark:border-blue-800">
                          {suppliedCount} Products
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {s.contactPerson} • {s.phone}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px] max-w-[200px] truncate" title={s.address}>
                      {s.address}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {s.paymentTerms || 'Net 30'}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {formatBDT(s.totalPurchased)}
                    </td>

                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                      {formatBDT(s.totalPaid)}
                    </td>

                    <td className="py-3 px-4 text-right font-black">
                      <span className={isDue ? 'text-red-600' : 'text-emerald-600'}>
                        {formatBDT(s.totalDue)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProducts(s)}
                          title="View Products Supplied & Ledger"
                          className="py-1 px-2.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Products</span>
                        </button>

                        <button
                          onClick={() => onEditSupplier(s)}
                          title="Edit Supplier"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete supplier "${s.name}"?`)) {
                              onDeleteSupplier(s.id);
                            }
                          }}
                          title="Delete Supplier"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
