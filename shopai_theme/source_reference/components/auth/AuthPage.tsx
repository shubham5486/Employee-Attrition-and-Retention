import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Crown,
  Key,
  HelpCircle,
  Layers,
  Sun,
  Moon,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { UserRole, DemoAccount, AuthUser, StandardUserRole } from '../../types';
import { CustomizeProfilesModal } from './CustomizeProfilesModal';

interface AuthPageProps {
  onAuthSuccess: (user: AuthUser) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'alert') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  darkMode,
  onToggleDarkMode,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isHigherAuthorityMode, setIsHigherAuthorityMode] = useState(false);

  // Login form state (pre-filled for effortless 1-click entry)
  const [loginEmail, setLoginEmail] = useState('admin@shopai.enterprise');
  const [loginPassword, setLoginPassword] = useState('ShopAI@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regRoleType, setRegRoleType] = useState<string>('HR Manager');
  const [customRoleInput, setCustomRoleInput] = useState<string>('');
  const [regBaseClearance, setRegBaseClearance] = useState<StandardUserRole>('HR Manager');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedEditAccountId, setSelectedEditAccountId] = useState<string | null>(null);

  // Fetch demo accounts from backend API securely
  useEffect(() => {
    let isMounted = true;
    authService.getDemoAccounts().then((accounts) => {
      if (isMounted) setDemoAccounts(accounts);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // When Higher Authority mode is toggled, pre-fill executive credentials if user chooses
  const handleToggleHigherAuthority = () => {
    const nextState = !isHigherAuthorityMode;
    setIsHigherAuthorityMode(nextState);
    if (nextState) {
      const execAccount = demoAccounts.find((a) => a.isHigherAuthority);
      if (execAccount) {
        setLoginEmail(execAccount.email);
        setLoginPassword(execAccount.passwordHint);
        showToast('Switched to Higher Authority C-Suite Authentication Portal', 'info');
      }
    } else {
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickDemoLogin = async (account: DemoAccount) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoginEmail(account.email);
    setLoginPassword(account.passwordHint);

    try {
      const res = await authService.login({
        email: account.email,
        password: account.passwordHint,
        rememberMe: true,
      });

      if (res.success && res.user) {
        showToast(`Authorized as ${res.user.name} (${res.user.role})`, 'success');
        onAuthSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Authentication failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both corporate email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.login({
        email: loginEmail,
        password: loginPassword,
        rememberMe,
      });

      if (res.success && res.user) {
        showToast(res.message || 'Authentication successful!', 'success');
        onAuthSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication service error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const effectiveRole: UserRole =
      regRoleType === 'custom'
        ? (customRoleInput.trim() || 'Custom Specialist')
        : (regRoleType as UserRole);

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        companyName: regCompany || 'Enterprise Corp',
        role: effectiveRole,
      });

      if (res.success && res.user) {
        showToast(`Account created successfully for ${res.user.name}!`, 'success');
        onAuthSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration service error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const res = await authService.forgotPassword(forgotEmail);
    setForgotStatus(res.message);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden bg-slate-900 selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Top Header Controls (Theme switch & Higher Authority Gate toggle) */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-8 flex items-center gap-3 z-20">
        {/* Dedicated Higher Authority Gate Switcher */}
        <button
          onClick={handleToggleHigherAuthority}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-md ${
            isHigherAuthorityMode
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 ring-2 ring-amber-300'
              : 'border border-slate-700 bg-slate-800/80 text-amber-400 hover:bg-slate-800 hover:border-amber-500/40'
          }`}
          title="Toggle dedicated Higher Authority executive entrance"
        >
          <Crown className={`h-4 w-4 ${isHigherAuthorityMode ? 'fill-current' : ''}`} />
          <span>{isHigherAuthorityMode ? 'Higher Authority Active' : 'Higher Authority Access'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleDarkMode}
          className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Toggle color theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Central Auth Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        {/* LEFT COLUMN: Brand Showcase & Value Proposition (5 Cols on Desktop) */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-indigo-950/80 via-slate-950/90 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 text-white">
          <div>
            {/* Prominent Official Product Branding: SHOP AI */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  SHOP AI
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                  Enterprise Edition
                </span>
              </div>
            </div>

            {/* Official Tagline */}
            <div className="mt-6">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                AI-Powered Workforce Intelligence & Employee Retention
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                Empower human capital leaders with predictive attrition modeling, TreeSHAP explainability, what-if scenario simulations, and financial risk governance.
              </p>
            </div>

            {/* Higher Authority Banner if mode is active */}
            {isHigherAuthorityMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Crown className="h-4 w-4 text-amber-400" />
                  Higher Authority Executive Portal
                </div>
                <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
                  Clearance level: C-Suite / Executive Board. Unlocks organization-wide turnover exposure (₹12.48 Cr), audit logs, and strategic capital allocation.
                </p>
              </motion.div>
            )}

            {/* Core Feature Checklist */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Ensemble ML Engine (94.2% ROC-AUC Accuracy)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Explainable TreeSHAP Factor Attributions</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Interactive What-If Policy & Salary Simulator</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Role-Based Access Control & PII Masking</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Login Pill Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
              <span className="font-semibold uppercase tracking-wider text-indigo-400">
                1-Click Demo Logins:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedEditAccountId(null);
                  setIsCustomizeModalOpen(true);
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                title="Customize names like HR Manager, Analyst, etc."
              >
                <Edit3 className="h-3 w-3" />
                <span>Change Names & Roles</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => handleQuickDemoLogin(account)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleQuickDemoLogin(account);
                    }
                  }}
                  className={`group relative flex flex-col justify-between p-2.5 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left ${
                    account.isHigherAuthority
                      ? 'border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-200'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">{account.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEditAccountId(account.id);
                          setIsCustomizeModalOpen(true);
                        }}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-700/80 hover:text-indigo-300 transition-colors"
                        title={`Edit name and role title for ${account.name}`}
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      {account.isHigherAuthority && (
                        <Crown className="h-3 w-3 text-amber-400 shrink-0" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 truncate mt-0.5">
                    <span className="truncate font-medium">{account.role}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-right">
              <span className="text-[10px] text-slate-500">
                Click card to log in • Click ✏️ to customize names
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Login & Registration Forms (7 Cols on Desktop) */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-slate-950 flex flex-col justify-between">
          <div>
            {/* Tab Switcher: Sign In vs Create Account */}
            <div className="flex items-center p-1 rounded-2xl border border-slate-800 bg-slate-900/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In to SHOP AI
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Enterprise Account
              </button>
            </div>

            {/* Error Message Callout */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800/80 p-3 text-xs text-rose-300"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4 text-xs"
              >
                {/* Email Field */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Corporate Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@shopai.enterprise"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-semibold">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setIsForgotModalOpen(true);
                        setForgotStatus(null);
                      }}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-10 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span className="text-slate-400">Remember this workstation</span>
                  </label>

                  <span className="text-[11px] text-slate-500 font-mono">JWT 256-bit Token</span>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isHigherAuthorityMode
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Verifying JWT Credentials...</span>
                    </div>
                  ) : (
                    <>
                      <span>{isHigherAuthorityMode ? 'Authorize Higher Authority Session' : 'Sign In to SHOP AI'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Instant 1-Click Direct Access options */}
                <div className="pt-2">
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-2 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Or Direct 1-Click Entry
                    </span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        const adminAccount = demoAccounts.find((a) => a.role === 'HR Admin') || {
                          id: 'demo-admin',
                          role: 'HR Admin' as const,
                          name: 'Sarah Jenkins',
                          email: 'admin@shopai.enterprise',
                          passwordHint: 'ShopAI@2026',
                          description: 'Full People Operations authorization',
                          badge: 'Admin Access',
                          isHigherAuthority: false,
                        };
                        handleQuickDemoLogin(adminAccount);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 text-xs font-semibold transition-all hover:scale-[1.01]"
                    >
                      <Shield className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Enter as Admin</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        const execAccount = demoAccounts.find((a) => a.isHigherAuthority) || {
                          id: 'demo-executive',
                          role: 'Executive / Higher Authority' as const,
                          name: 'Vikram Malhotra',
                          email: 'executive@shopai.enterprise',
                          passwordHint: 'ShopAI@2026',
                          description: 'Elevated C-Suite clearance',
                          badge: 'Higher Authority',
                          isHigherAuthority: true,
                        };
                        handleQuickDemoLogin(execAccount);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 text-xs font-semibold transition-all hover:scale-[1.01]"
                    >
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                      <span>Enter as C-Suite</span>
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            {/* TAB 2: REGISTER / CREATE ACCOUNT FORM */}
            {activeTab === 'register' && (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3 text-xs"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ananya Sen"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Work Email & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="user@enterprise.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Global Technologies Inc"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">
                      Organizational Role & Clearance Level
                    </label>
                    <span className="text-[11px] text-indigo-400 font-medium">Fully Customizable</span>
                  </div>
                  <select
                    value={regRoleType}
                    onChange={(e) => setRegRoleType(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 text-xs text-white font-medium focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="HR Admin">HR Admin (Full Directory & Intervention Authority)</option>
                    <option value="HR Manager">HR Manager (Team Retention & Simulation Modeling)</option>
                    <option value="Analyst">Analyst (Data Analytics & Masked Compensation)</option>
                    <option value="Executive / Higher Authority">
                      Executive / Higher Authority (C-Suite Board Level & Financial Exposure)
                    </option>
                    <option value="custom">✏️ Custom Role / Job Title (Give your own choice)...</option>
                  </select>

                  {/* Custom Role Name Input */}
                  {regRoleType === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 space-y-2.5 rounded-xl border border-indigo-900/60 bg-indigo-950/25 p-3 text-xs"
                    >
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Your Custom Role Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customRoleInput}
                          onChange={(e) => setCustomRoleInput(e.target.value)}
                          placeholder="e.g. Talent Partner, People Ops Lead, Retention Specialist"
                          className="h-9 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          System Clearance & Permission Rights
                        </label>
                        <select
                          value={regBaseClearance}
                          onChange={(e) => setRegBaseClearance(e.target.value as StandardUserRole)}
                          className="h-8 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                        >
                          <option value="HR Admin">Admin Clearance (Interventions & Full Staff Directory)</option>
                          <option value="HR Manager">Manager Clearance (Retention Plans & Team Diagnostics)</option>
                          <option value="Analyst">Analyst Clearance (Workforce Analytics & Masked Pay)</option>
                          <option value="Executive / Higher Authority">
                            Executive Clearance (C-Suite Financial & Board Strategy)
                          </option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-8 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account & Provisioning Token...</span>
                    </div>
                  ) : (
                    <>
                      <span>Complete Registration & Launch Platform</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              SOC2 Type II & GDPR Compliant
            </span>
            <span>SHOP AI Security Gateway v3.4</span>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-xs space-y-4 text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-400" />
                Reset SHOP AI Access Key
              </h3>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-400 leading-relaxed">
              Enter your corporate email address. A password recovery verification dispatch will be triggered.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@shopai.enterprise"
                  className="h-10 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {forgotStatus && (
                <div className="rounded-xl bg-emerald-950/60 border border-emerald-800/80 p-3 text-emerald-300">
                  {forgotStatus}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-3.5 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal to customize demo login profiles & role names */}
      <CustomizeProfilesModal
        isOpen={isCustomizeModalOpen}
        onClose={() => {
          setIsCustomizeModalOpen(false);
          setSelectedEditAccountId(null);
        }}
        accounts={demoAccounts}
        initialSelectedId={selectedEditAccountId}
        onSave={(updated) => {
          setDemoAccounts(updated);
        }}
        showToast={showToast}
      />
    </div>
  );
};
