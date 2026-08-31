'use client';

import React from 'react';
import { Award, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { formatBDT } from '@/lib/utils';

interface TopProductsTableProps {
  topProducts: Array<{
    name: string;
    category: string;
    soldUnits: number;
    revenue: number;
    profit: number;
  }>;
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ topProducts }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Top Velocity Selling Products</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3 text-center">Units Sold</th>
              <th className="py-2.5 px-3 text-right">Revenue</th>
              <th className="py-2.5 px-3 text-right">Profit Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {topProducts.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2.5 px-3">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{p.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block pl-5">{p.category}</span>
                </td>

                <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                  {p.soldUnits} pcs
                </td>

                <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                  {formatBDT(p.revenue)}
                </td>

                <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                  {formatBDT(p.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
