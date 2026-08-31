import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'SalesTrack - Sales & Inventory Tracking System',
  description: 'High-performance SalesTrack Sales & Inventory Tracking System with fast POS, real-time inventory sync, multi-role RBAC, bKash/Nagad/Card payments, and supplier purchase ledger.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%233b82f6'/><rect x='25' y='25' width='20' height='20' rx='4' fill='white'/><rect x='55' y='25' width='20' height='20' rx='4' fill='%2393c5fd'/><rect x='25' y='55' width='20' height='20' rx='4' fill='%2393c5fd'/><rect x='55' y='55' width='20' height='20' rx='4' fill='white'/></svg>",
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
