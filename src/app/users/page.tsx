'use client';

import React from 'react';
import { UserTable } from '@/components/users/UserTable';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function UsersPage() {
  const { currentUser } = useAuth();

  if (currentUser?.role !== 'Administrator') {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/40 shadow-xl my-12">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Administrator Access Required
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Only Administrators can manage user registrations, approve requests, and promote or demote user roles. Switch to an Administrator account from the top navbar to access this module.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          User & RBAC Authorization
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Control system access, review applicant requests, approve roles, and manage permissions.
        </p>
      </div>

      <UserTable />
    </div>
  );
}
