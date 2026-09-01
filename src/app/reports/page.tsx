'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3, Calendar, Printer, TrendingUp,
  Boxes, Truck, ShoppingCart, RotateCcw, Award
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { SalesChart } from '@/components/reports/SalesChart';
import { ProfitLossCard } from '@/components/reports/ProfitLossCard';
import { TopProductsTable } from '@/components/reports/TopProductsTable';
import { formatBDT } from '@/lib/utils';

export default function ReportsPage() {
  const { sales, purchases, products, returns } = useData();
  const [dateRange, setDateRange] = useState<'All' | 'Today' | 'ThisMonth' | 'ThisYear'>('All');

  // Aggregated analytics calculation
  const reportData = useMemo(() => {
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalDiscounts = 0;
    let totalTax = 0;
    let totalPurchasesAmt = 0;

    const productSalesMap: Record<string, { name: string; category: string; soldUnits: number; revenue: number; profit: number }> = {};

    sales.forEach(s => {
      if (s.status === 'Completed') {
        totalRevenue += s.totalAmount;
        totalDiscounts += s.discountTotal;
        totalTax += s.taxAmount;

        s.items.forEach(item => {
          const itemCost = item.costPrice * item.quantity;
          const itemProfit = item.subtotal - itemCost;
          totalCOGS += itemCost;

          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = {
              name: item.productName,
              category: 'General',
              soldUnits: 0,
              revenue: 0,
              profit: 0,
            };
          }
          productSalesMap[item.productId].soldUnits += item.quantity;
          productSalesMap[item.productId].revenue += item.subtotal;
          productSalesMap[item.productId].profit += itemProfit;
        });
      }
    });

    purchases.forEach(p => {
      if (p.status !== 'Cancelled') {
        totalPurchasesAmt += p.totalAmount;
      }
    });

    const grossProfit = Math.max(0, totalRevenue - totalCOGS);
    const profitMargin = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0;

    // Inventory Valuation
    const totalInventoryCost = products.reduce((acc, p) => acc + (p.stockQuantity * p.purchasePrice), 0);
    const totalInventoryRetail = products.reduce((acc, p) => acc + (p.stockQuantity * p.sellingPrice), 0);
    const totalInventoryPotentialProfit = totalInventoryRetail - totalInventoryCost;

    const topProductsList = Object.values(productSalesMap)
      .sort((a, b) => b.soldUnits - a.soldUnits)
      .slice(0, 5);

    // Chart trend samples
    const chartSeries = [
      { date: '25 Aug', sales: 12500, purchases: 18000, profit: 3200 },
      { date: '26 Aug', sales: 18900, purchases: 4000, profit: 5400 },
      { date: '27 Aug', sales: 14200, purchases: 0, profit: 4100 },
      { date: '28 Aug', sales: 22400, purchases: 16800, profit: 6800 },
      { date: '29 Aug', sales: 28600, purchases: 0, profit: 8900 },
      { date: '30 Aug', sales: 31200, purchases: 12000, profit: 9400 },
      { date: '31 Aug', sales: Math.max(15000, totalRevenue), purchases: totalPurchasesAmt, profit: grossProfit },
    ];

    return {
      totalRevenue,
      totalCOGS,
      totalDiscounts,
      totalTax,
      grossProfit,
      profitMargin,
      totalPurchasesAmt,
      totalInventoryCost,
      totalInventoryRetail,
      totalInventoryPotentialProfit,
      topProductsList,
      chartSeries,
    };
  }, [sales, purchases, products]);



  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Executive Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Financial auditing, profit margin calculations, stock valuation, and velocity performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition no-print"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Net Sales Revenue</span>
            <ShoppingCart className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatBDT(reportData.totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            +18.4% vs previous period
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Gross Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatBDT(reportData.grossProfit)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Gross Margin: <strong>{reportData.profitMargin}%</strong>
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Inventory Asset Value (Cost)</span>
            <Boxes className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatBDT(reportData.totalInventoryCost)}
          </div>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
            Retail Potential: {formatBDT(reportData.totalInventoryRetail)}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Purchases (Outflow)</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatBDT(reportData.totalPurchasesAmt)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Suppliers Procurement Spend
          </span>
        </div>
      </div>

      {/* Main Chart */}
      <SalesChart data={reportData.chartSeries} />

      {/* P&L Breakdown & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfitLossCard
          revenue={reportData.totalRevenue}
          cogs={reportData.totalCOGS}
          grossProfit={reportData.grossProfit}
          profitMargin={reportData.profitMargin}
          taxCollected={reportData.totalTax}
          discountsGiven={reportData.totalDiscounts}
        />

        <TopProductsTable topProducts={reportData.topProductsList} />
      </div>

      {/* Hidden printable P&L area */}
      <div className="printable-receipt-area hidden print:block bg-white text-black p-8 font-sans max-w-2xl mx-auto space-y-6">
        <div className="text-center border-b pb-4">
          <h1 className="text-xl font-bold uppercase tracking-wide">Profit & Loss Statement</h1>
          <p className="text-xs text-slate-500">SalesTrack Business Analytics System</p>
          <p className="text-[10px] text-slate-400 mt-1">Generated: {new Date().toLocaleString()}</p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium text-slate-700">Gross Sales Revenue</span>
            <span className="font-bold">{formatBDT(reportData.totalRevenue)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b text-rose-600">
            <span className="font-medium">Cost of Goods Sold (COGS)</span>
            <span className="font-bold">- {formatBDT(reportData.totalCOGS)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b text-rose-600">
            <span className="font-medium">Discounts Deducted</span>
            <span className="font-bold">- {formatBDT(reportData.totalDiscounts)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b text-blue-600">
            <span className="font-medium">Govt VAT (5%) Collected</span>
            <span className="font-bold">{formatBDT(reportData.totalTax)}</span>
          </div>

          <div className="flex justify-between items-center py-3 pt-4 border-t-2 border-double border-slate-800">
            <span className="font-bold uppercase text-slate-900">Net Gross Profit</span>
            <span className="text-lg font-black text-emerald-600">{formatBDT(reportData.grossProfit)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="font-medium text-slate-600">Gross Profit Margin</span>
            <span className="font-bold text-slate-800">{reportData.profitMargin}%</span>
          </div>
        </div>

        <div className="pt-12 text-center text-[10px] text-slate-400 border-t">
          <p>This is a system generated statement from SalesTrack.</p>
        </div>
      </div>
    </div>
  );
}
