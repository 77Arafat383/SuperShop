'use client';

import React, { useState } from 'react';
import { 
  Truck, Plus, CheckCircle, Clock, CreditCard, Receipt, 
  Search, Eye, ArrowDownToLine 
} from 'lucide-react';
import { PurchaseOrder, PurchasePaymentRecord } from '@/types';
import { formatBDT, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface PurchaseOrderTableProps {
  purchases: PurchaseOrder[];
  onOpenCreatePO: () => void;
  onReceiveGoods: (poId: string) => void;
  onOpenPayDue: (po: PurchaseOrder) => void;
  onViewReceipt: (po: PurchaseOrder, receipt: PurchasePaymentRecord) => void;
}

export const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
  purchases,
  onOpenCreatePO,
  onReceiveGoods,
  onOpenPayDue,
  onViewReceipt,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = purchases.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || po.status === statusFilter || po.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Requested': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'Accepted': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      case 'Draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Partial': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Due': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
            placeholder="Search PO number, supplier..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="All">All POs & Payments</option>
            <option value="Requested">Status: Requested</option>
            <option value="Received">Status: Received</option>
            <option value="Due">Payment: Due</option>
            <option value="Partial">Payment: Partial</option>
            <option value="Paid">Payment: Paid</option>
          </select>

          <button
            onClick={onOpenCreatePO}
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">PO Number & Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Due Balance</th>
                <th className="py-3 px-4 text-center">PO Status</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.map((po) => {
                const isDue = po.dueAmount > 0;
                const canReceive = po.status !== 'Received';

                return (
                  <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {po.poNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatDate(po.orderDate)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {po.supplierName}
                      </div>
                      <div className="text-[10px] text-slate-500">{po.supplierPhone}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {po.items.length} items ({po.items.reduce((s, i) => s + i.quantity, 0)} units)
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatBDT(po.totalAmount)}
                    </td>

                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                      {formatBDT(po.paidAmount)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold">
                      <span className={isDue ? 'text-red-600' : 'text-slate-400'}>
                        {formatBDT(po.dueAmount)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(po.status)}`}>
                        {po.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getPaymentBadge(po.paymentStatus)}`}>
                        {po.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canReceive && (
                          <button
                            onClick={() => onReceiveGoods(po.id)}
                            title="Receive Goods into Inventory"
                            className="py-1 px-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                            <span>Receive</span>
                          </button>
                        )}

                        {isDue && (
                          <button
                            onClick={() => onOpenPayDue(po)}
                            title="Pay Remaining Due"
                            className="py-1 px-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900 text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Due</span>
                          </button>
                        )}

                        {po.paymentHistory.length > 0 && (
                          <button
                            onClick={() => onViewReceipt(po, po.paymentHistory[po.paymentHistory.length - 1])}
                            title="View Last Payment Receipt"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                          >
                            <Receipt className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                        )}
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
