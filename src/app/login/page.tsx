'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Boxes, Lock, Mail, User as UserIcon, Phone, ArrowRight, 
  CheckCircle2, AlertCircle, KeyRound, ShieldCheck, RefreshCw, X, Sparkles 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, resetPassword, users } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [requestedRole, setRequestedRole] = useState<UserRole>('Cashier');

  // Forgot Password Card Modal states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

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

  const openForgotModal = () => {
    setResetEmail(loginEmail);
    setResetStep(1);
    setGeneratedCode('');
    setInputCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setIsForgotModalOpen(true);
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const clean = resetEmail.trim().toLowerCase();
    if (!clean) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    const userExists = users.some(u => u.email.toLowerCase() === clean);
    if (!userExists) {
      setForgotError('No registered account found matching this email address.');
      return;
    }

    // Generate 6-digit PIN code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setResetStep(2);
    setForgotSuccess(`6-Digit Verification PIN (${code}) sent to ${clean}`);
  };

  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (inputCode.trim() !== generatedCode) {
      setForgotError('Invalid 6-digit PIN code. Please check your code and try again.');
      return;
    }

    if (newPassword.length < 4) {
      setForgotError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(resetEmail, newPassword);
      if (res.success) {
        setSuccessMsg('Password updated successfully! Please sign in with your new password.');
        setLoginEmail(resetEmail);
        setLoginPassword(newPassword);
        setIsForgotModalOpen(false);
      } else {
        setForgotError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Error updating password');
    } finally {
      setIsSubmitting(false);
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
          <Boxes className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          SalesTrack
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Sales & Inventory Tracking System
        </p>
      </div>

      {/* Main Login / Registration Card */}
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Tab switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'login'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'register'
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
        {activeTab === 'login' && (
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
                  placeholder="e.g. example@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold rounded-xl text-xs text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: REGISTRATION FORM */}
        {activeTab === 'register' && (
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
                  placeholder="e.g. example@gmail.com"
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
                <option value="Cashier">Cashier</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Purchase Manager">Purchase Manager</option>
                <option value="Administrator">Administrator</option>
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

      {/* POPUP CARD MODAL FOR FORGOT PASSWORD & PIN VERIFICATION */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-sm font-bold">Password Recovery</h3>
              </div>
              <button 
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Modal Internal Alerts */}
              {forgotError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {resetStep === 1 ? (
                /* Step 1 Card View: Enter Email & Request PIN */
                <form onSubmit={handleSendCode} className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter your registered account email. A 6-digit verification PIN code will be sent to your email to authorize setting a new password.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. example@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold rounded-xl text-xs text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Send 6-Digit PIN</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2 Card View: Enter PIN & Set New Password */
                <form onSubmit={handleVerifyAndResetPassword} className="space-y-3.5">
                  <div className="flex items-center justify-between p-2.5 bg-blue-950/40 border border-blue-900/60 rounded-xl text-xs">
                    <span className="text-slate-300">PIN sent to: <strong>{resetEmail}</strong></span>
                    <button
                      type="button"
                      onClick={() => { setResetStep(1); setForgotError(''); setForgotSuccess(''); }}
                      className="text-blue-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enter 6-Digit PIN *
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="e.g. 849201"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold rounded-xl text-xs text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Saving Password...' : 'Save New Password'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-[11px] text-slate-500 text-center space-y-1">
        <p>
          By signing in or submitting a request, you agree to our{' '}
          <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
