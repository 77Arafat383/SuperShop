'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Lock, Mail, User as UserIcon, Phone, 
  ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Sparkles, KeyRound 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, quickLoginAs, users } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('admin@ims.nstu.edu.bd');
  const [loginPassword, setLoginPassword] = useState('admin123');
  
  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [requestedRole, setRequestedRole] = useState<UserRole>('Cashier');

  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success && res.user) {
        setSuccessMsg(`Welcome back, ${res.user.name} (${res.user.role})! Redirecting...`);
        setTimeout(() => {
          if (res.user?.role === 'Cashier') {
            router.push('/pos');
          } else {
            router.push('/dashboard');
          }
        }, 600);
      } else {
        setErrorMsg(res.error || 'Invalid credentials or account not approved.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setErrorMsg('Please fill in all registration fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        requestedRole,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        // Clear fields
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    quickLoginAs(role);
    if (role === 'Cashier') {
      router.push('/pos');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="text-center max-w-lg mb-8 z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/25 mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Sales & Inventory Tracking System
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Noakhali Science & Technology University • CSTE 3208 Project
        </p>
      </div>

      {/* 1-Click Fast Demo Role Login Bar */}
      <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 mb-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Fast Demo Login
          </span>
          <span className="text-[11px] text-slate-400">Select any role to test RBAC</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleQuickLogin('Administrator')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 hover:border-purple-500 text-purple-200 transition text-xs font-semibold group"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
            <span>Administrator</span>
          </button>

          <button
            onClick={() => handleQuickLogin('Cashier')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 hover:border-blue-500 text-blue-200 transition text-xs font-semibold group"
          >
            <UserIcon className="w-4 h-4 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
            <span>Cashier (POS)</span>
          </button>

          <button
            onClick={() => handleQuickLogin('Inventory Manager')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 hover:border-amber-500 text-amber-200 transition text-xs font-semibold group"
          >
            <KeyRound className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
            <span>Inventory Mgr</span>
          </button>

          <button
            onClick={() => handleQuickLogin('Purchase Manager')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 hover:border-emerald-500 text-emerald-200 transition text-xs font-semibold group"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <span>Purchase Mgr</span>
          </button>
        </div>
      </div>

      {/* Main Login / Registration Card */}
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Tab switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Apply for Account
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: LOGIN FORM */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. admin@ims.nstu.edu.bd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Automatic Role Detection:</span>
              <span className="text-blue-400 font-semibold">
                {users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase())?.role || 'Based on your assigned role'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold rounded-xl text-xs text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Tab 2: REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Md. Yeasin Arafat"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. arafat.cste@nstu.edu.bd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+880 1..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Requested System Role
              </label>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="Cashier">Cashier (Point of Sale & Billing)</option>
                <option value="Inventory Manager">Inventory Manager (Stock In/Out & Adjustments)</option>
                <option value="Purchase Manager">Purchase Manager (Supplier Orders & Payments)</option>
                <option value="Administrator">Administrator (System Approval Required)</option>
              </select>
              <p className="text-[11px] text-amber-400/90 mt-1">
                Note: All new registrations require Administrator approval before access is granted.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold rounded-xl text-xs text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting Application...' : 'Submit Registration Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500 text-center">
        Sales & Inventory Tracking System (RBMS) • NSTU CSTE 3208
      </div>
    </div>
  );
}
