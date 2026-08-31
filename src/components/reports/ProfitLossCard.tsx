'use client';

import React from 'react';
import { TrendingUp, DollarSign, Percent, Layers, ArrowUpRight } from 'lucide-react';
import { formatBDT } from '@/lib/utils';

interface ProfitLossCardProps {
  revenue: number;
  cogs: number;
  grossProfit: number;
  profitMargin: number;
  taxCollected: number;
  discountsGiven: number;
}

export const ProfitLossCard: React.FC<ProfitLossCardProps> = ({
  revenue,
  cogs,
  grossProfit,
  profitMargin,
  taxCollected,
  discountsGiven,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Profit & Loss Statement (P&L)</span>
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          Margin: {profitMargin}%
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500">Gross Sales Revenue:</span>
          <span className="font-bold text-slate-900 dark:text-white">{formatBDT(revenue)}</span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 text-rose-500">
          <span>Cost of Goods Sold (COGS):</span>
          <span className="font-bold">- {formatBDT(cogs)}</span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500">Discounts Deducted:</span>
          <span className="font-semibold text-rose-500">- {formatBDT(discountsGiven)}</span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-500">Govt VAT (5%) Collected:</span>
          <span className="font-semibold text-blue-500">{formatBDT(taxCollected)}</span>
        </div>

        <div className="flex justify-between items-baseline pt-2">
          <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">
            Net Gross Profit
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {formatBDT(grossProfit)}
          </span>
        </div>
      </div>
    </div>
  );
};
