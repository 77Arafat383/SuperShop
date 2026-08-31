'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2, ShoppingCart, UserCheck, LogOut, Bell,
  Sparkles, FileText, ChevronDown, CheckCircle2, User as LucideUser
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { UserRole } from '@/types';

export const Navbar: React.FC = () => {
  const { currentUser, logout, switchRole } = useAuth();
  const { products } = useData();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const lowStockCount = products.filter(p => p.stockQuantity <= p.minStockLevel).length;

  const roles: UserRole[] = ['Administrator', 'Inventory Manager', 'Purchase Manager', 'Cashier'];

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'Administrator': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300';
      case 'Inventory Manager': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300';
      case 'Purchase Manager': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'Cashier': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                RBMS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Sales & Inventory Tracking System
            </p>
          </div>
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Quick POS Access for Cashier / Admin */}
          {(currentUser?.role === 'Administrator' || currentUser?.role === 'Cashier') && (
            <Link
              href="/pos"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/20 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">POS Terminal</span>
            </Link>
          )}

          {/* Low stock alert icon */}
          <Link
            href="/inventory"
            title={`${lowStockCount} items low on stock`}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {lowStockCount}
              </span>
            )}
          </Link>

          {/* Active User Info & Dropdown */}
          <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition"
              title="View User Profile Menu"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <LucideUser className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {currentUser?.name || 'Guest User'}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                {/* Overlay to close the menu on click outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                />
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 transition animate-fade-in z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Role</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getRoleBadgeColor(currentUser?.role)}`}>
                        {currentUser?.role || 'No Role'}
                      </span>
                    </div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center gap-2 transition font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
