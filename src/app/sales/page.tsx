'use client';

import React, { useState } from 'react';
import { 
  Receipt, Search, Printer, RotateCcw, Calendar, 
  CreditCard, Smartphone, Banknote, User 
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Sale } from '@/types';
import { formatBDT, formatDate } from '@/lib/utils';
import { ReceiptModal } from '@/components/pos/ReceiptModal';

export default function SalesPage() {
  const { sales } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  const filtered = sales.filter(s => {
    const matchesSearch = 
      s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cashierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = methodFilter === 'All' || s.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'Cash': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'bKash': return 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300';
      case 'Nagad': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
      case 'Card': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      case 'Split': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Sales & Tax Invoices
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete register of customer sales, transaction audit records, and receipt reprint terminal.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice #, customer, cashier..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Card">Card</option>
            <option value="Split">Split</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items Sold</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {sale.invoiceNumber}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatDate(sale.saleDate)}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {sale.customerName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Cashier: {sale.cashierName}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {sale.items.length} items ({sale.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getMethodBadge(sale.paymentMethod)}`}>
                      {sale.paymentMethod}
                    </span>
                    {sale.paymentDetails.trxId && (
                      <span className="block text-[9px] font-mono text-slate-400 mt-0.5">
                        {sale.paymentDetails.trxId}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right text-slate-500 font-medium">
                    {formatBDT(sale.subtotal)}
                  </td>

                  <td className="py-3 px-4 text-right text-rose-500 font-semibold">
                    {sale.discountTotal > 0 ? `-৳${sale.discountTotal}` : '-'}
                  </td>

                  <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                    {formatBDT(sale.totalAmount)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedSaleForReceipt(sale)}
                      className="py-1.5 px-3 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 transition flex items-center gap-1.5 ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Reprint Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReceiptModal
        sale={selectedSaleForReceipt}
        isOpen={!!selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
        onNewSale={() => setSelectedSaleForReceipt(null)}
      />
    </div>
  );
}
