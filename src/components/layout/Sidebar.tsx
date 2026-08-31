'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Truck,
  Receipt, BarChart3, Users, RotateCcw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
  badge?: string;
}

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  className = "w-64 bg-slate-900 text-slate-300 h-full flex flex-col justify-between p-4 shrink-0 hidden md:flex border-r border-slate-800"
}) => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const currentRole = currentUser?.role || 'Cashier';

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['Administrator', 'Inventory Manager', 'Purchase Manager', 'Cashier'],
    },
    {
      name: 'POS Terminal',
      href: '/pos',
      icon: ShoppingCart,
      allowedRoles: ['Administrator', 'Cashier'],
      badge: 'Fast',
    },
    {
      name: 'Products & Catalog',
      href: '/products',
      icon: Package,
      allowedRoles: ['Administrator', 'Inventory Manager'],
    },
    {
      name: 'Inventory & Stocks',
      href: '/inventory',
      icon: Boxes,
      allowedRoles: ['Administrator', 'Inventory Manager'],
    },
    {
      name: 'Purchases & Orders',
      href: '/purchases',
      icon: Truck,
      allowedRoles: ['Administrator', 'Purchase Manager'],
    },
    {
      name: 'Suppliers Directory',
      href: '/suppliers',
      icon: Truck,
      allowedRoles: ['Administrator', 'Purchase Manager'],
    },
    {
      name: 'Sales & Invoices',
      href: '/sales',
      icon: Receipt,
      allowedRoles: ['Administrator', 'Cashier'],
    },
    {
      name: 'Returns & Refunds',
      href: '/returns',
      icon: RotateCcw,
      allowedRoles: ['Administrator', 'Cashier', 'Inventory Manager'],
    },
    {
      name: 'Reports & Analytics',
      href: '/reports',
      icon: BarChart3,
      allowedRoles: ['Administrator', 'Purchase Manager', 'Inventory Manager'],
    },
    {
      name: 'User Management',
      href: '/users',
      icon: Users,
      allowedRoles: ['Administrator'],
    },
  ];

  const filteredNavItems = navItems.filter(item => item.allowedRoles.includes(currentRole));

  return (
    <aside className={className}>
      <div className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-none">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {currentRole}
        </div>

        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${isActive
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-blue-400 border border-blue-500/20'
                  }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="pt-4 mt-6 border-t border-slate-800 text-center flex flex-col items-center justify-center gap-1.5">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-white tracking-tight">
            SalesTrack
          </span>
        </div>
        <div className="text-[10px] text-slate-500">
          &copy; {new Date().getFullYear()} SalesTrack. All rights reserved.
        </div>
        <div className="text-[9px] text-slate-600">
          Md. Yeasin Arafat & Ahosan Habib
        </div>
      </div>
    </aside>
  );
};
