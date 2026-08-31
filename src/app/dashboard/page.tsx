'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp, ShoppingBag, ShoppingCart, Truck, Boxes,
  RotateCcw, AlertTriangle, Users, ArrowUpRight, DollarSign,
  Calendar, CheckCircle2, Sparkles, Plus, Clock
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatBDT, formatDate } from '@/lib/utils';
import { SalesChart } from '@/components/reports/SalesChart';

export default function DashboardPage() {
  const { metrics, sales, products, purchases } = useData();
  const { currentUser } = useAuth();

  const recentSales = sales.slice(0, 5);
  const lowStockItems = products.filter(p => p.stockQuantity <= p.minStockLevel);

  const chartData = [
    { date: '25 Aug', sales: 12000, purchases: 8000, profit: 3400 },
    { date: '26 Aug', sales: 15400, purchases: 12000, profit: 4200 },
    { date: '27 Aug', sales: 18900, purchases: 0, profit: 5800 },
    { date: '28 Aug', sales: 22100, purchases: 18800, profit: 6400 },
    { date: '29 Aug', sales: 27500, purchases: 4000, profit: 8900 },
    { date: '30 Aug', sales: 31000, purchases: 16800, profit: 9800 },
    { date: '31 Aug', sales: Math.max(16000, metrics.todaySales), purchases: metrics.monthlyPurchases, profit: metrics.totalProfit },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl shadow-blue-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
              {currentUser?.role || 'Guest'} Session
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Welcome back, {currentUser?.name}!
          </h1>

        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(currentUser?.role === 'Administrator' || currentUser?.role === 'Cashier') && (
            <Link
              href="/pos"
              className="py-2.5 px-4 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Open POS Terminal</span>
            </Link>
          )}

          {(currentUser?.role === 'Administrator' || currentUser?.role === 'Purchase Manager') && (
            <Link
              href="/purchases"
              className="py-2.5 px-4 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/80 border border-white/20 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>New PO Order</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Sales */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Today&apos;s Sales</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatBDT(metrics.todaySales)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-blue-600">{metrics.todayTransactions} receipts</span>
            <span>issued today</span>
          </div>
        </div>

        {/* 2. Monthly & Yearly Purchases */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Procurement Spend</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatBDT(metrics.monthlyPurchases)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
            <span>Yearly Purchases:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{formatBDT(metrics.yearlyPurchases)}</span>
          </div>
        </div>

        {/* 3. Product Returns & Return Rate */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Product Returns</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
            {metrics.totalProductReturns} Units
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
            <span>Return Incident Rate:</span>
            <span className="font-bold text-purple-600">{metrics.returnRate}%</span>
          </div>
        </div>

        {/* 4. Total Gross Profit */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Gross Profit</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatBDT(metrics.totalProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Profitable net margin across inventory
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <SalesChart data={chartData} />

      {/* Two Column Grid: Low Stock Warnings & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Alerts ({lowStockItems.length})</span>
            </h3>
            <Link href="/inventory" className="text-xs text-blue-600 font-semibold hover:underline">
              View All
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              All inventory items are healthy above their minimum threshold.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {lowStockItems.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Supplier: {item.supplierName} • SKU: {item.sku}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-amber-700 dark:text-amber-300">
                      {item.stockQuantity} {item.unit} left
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      (Min: {item.minStockLevel})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Completed Sales */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span>Recent Completed Orders</span>
            </h3>
            <Link href="/sales" className="text-xs text-blue-600 font-semibold hover:underline">
              View All Invoices
            </Link>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {recentSales.map(sale => (
              <div
                key={sale.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {sale.invoiceNumber}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {sale.customerName} • {sale.paymentMethod}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-slate-900 dark:text-white">
                    {formatBDT(sale.totalAmount)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {formatDate(sale.saleDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
