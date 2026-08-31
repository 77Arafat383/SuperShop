'use client';

import React, { useState } from 'react';
import { 
  Users, CheckCircle, XCircle, Shield, ArrowUpRight, 
  Trash2, Search, Sparkles, Filter, AlertCircle, Clock 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { User, UserRole, UserStatus } from '@/types';
import { formatDate } from '@/lib/utils';

export const UserTable: React.FC = () => {
  const { 
    users, 
    currentUser, 
    approveUser, 
    rejectUser, 
    updateUserRole, 
    updateUserStatus, 
    deleteUser 
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const pendingUsers = users.filter(u => u.status === 'Pending Approval');
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Administrator': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Inventory Manager': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Purchase Manager': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Cashier': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Pending Approval': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse';
      case 'Inactive': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'Suspended': return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Approvals Callout Banner */}
      {pendingUsers.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Pending Registration Requests ({pendingUsers.length})
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                These users signed up and requested role assignments. Review and approve or reject their access.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {pendingUsers.map(u => (
              <div key={u.id} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{u.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      Requests: {u.requestedRole || u.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{u.email} • {u.phone}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Applied on: {formatDate(u.createdAt)}</div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => approveUser(u.id)}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve ({u.requestedRole || u.role})</span>
                  </button>
                  <button
                    onClick={() => rejectUser(u.id)}
                    className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 text-xs font-semibold rounded-lg transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Inventory Manager">Inventory Manager</option>
              <option value="Purchase Manager">Purchase Manager</option>
              <option value="Cashier">Cashier</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Registered Accounts & Role RBAC Management</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Promote, demote, approve, or remove user accounts across RBMS modules.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Total Users: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Promote / Change Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredUsers.map((user) => {
                const isSelf = currentUser?.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {user.name}
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-normal">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px]">{user.email}</div>
                      {user.phone && <div className="text-slate-400 text-[10px]">{user.phone}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        disabled={user.status === 'Pending Approval'}
                        onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition disabled:opacity-40"
                      >
                        <option value="Cashier">Cashier</option>
                        <option value="Inventory Manager">Inventory Manager</option>
                        <option value="Purchase Manager">Purchase Manager</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.status === 'Pending Approval' ? (
                          <>
                            <button
                              onClick={() => approveUser(user.id)}
                              title="Approve User"
                              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => rejectUser(user.id)}
                              title="Reject"
                              className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            {user.status === 'Active' ? (
                              <button
                                onClick={() => updateUserStatus(user.id, 'Inactive')}
                                title="Deactivate"
                                disabled={isSelf}
                                className="px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition disabled:opacity-30"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(user.id, 'Active')}
                                title="Activate"
                                className="px-2 py-1 rounded-lg text-[10px] font-medium bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-950 transition"
                              >
                                Activate
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete user "${user.name}"?`)) {
                                  deleteUser(user.id);
                                }
                              }}
                              disabled={isSelf}
                              title="Remove User"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
