'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // If on login page, render children directly
  const isAuthPage = pathname === '/login';

  React.useEffect(() => {
    if (!isLoading && !currentUser && !isAuthPage) {
      router.push('/login');
    }
  }, [currentUser, isLoading, isAuthPage, router]);

  React.useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="text-xs text-slate-400 mt-2">Loading SalesTrack...</p>
      </div>
    );
  }

  if (isAuthPage) {
    return <main className="min-h-screen bg-slate-950 text-slate-100">{children}</main>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased overflow-hidden relative">
      <Navbar onToggleSidebar={() => setIsMobileSidebarOpen(true)} />
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fade-in">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-64 bg-slate-900 text-slate-300 shadow-2xl h-full transition-transform duration-300 transform translate-x-0">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Reused Sidebar Component with reset layout class */}
            <Sidebar className="w-full bg-slate-900 text-slate-300 h-full flex flex-col justify-between p-4" />
          </div>
        </div>
      )}
    </div>
  );
};
