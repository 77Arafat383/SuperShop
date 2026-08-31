import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'SalesTrack - Sales & Inventory Tracking System',
  description: 'High-performance SalesTrack Sales & Inventory Tracking System with fast POS, real-time inventory sync, multi-role RBAC, bKash/Nagad/Card payments, and supplier purchase ledger.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%232563eb'/><stop offset='100%25' stop-color='%234f46e5'/></linearGradient></defs><rect width='100' height='100' rx='30' fill='url(%23grad)'/><path d='M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z' fill='none' stroke='white' stroke-width='6' stroke-linejoin='round'/><path d='M50 20 L50 80' fill='none' stroke='white' stroke-width='4'/><path d='M20 35 L50 50 L80 35' fill='none' stroke='white' stroke-width='4'/></svg>",
  }
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
