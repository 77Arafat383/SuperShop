import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'RBMS - Sales & Inventory Tracking System | NSTU CSTE 3208',
  description: 'High-performance Retail Business Management System (RBMS) with fast POS, real-time inventory sync, multi-role RBAC, bKash/Nagad/Card payments, and supplier purchase ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
        <AuthProvider>
          <DataProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
