import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Building,
  ChevronDown,
  UserCheck,
  Menu,
  Shield,
  Briefcase,
  TrendingUp,
  X,
  Sparkles,
  Crown,
  LogOut,
  UploadCloud,
  Edit3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, Employee, DemoAccount } from '../../types';
import { authService } from '../../services/authService';
import { CustomizeProfilesModal } from '../auth/CustomizeProfilesModal';

export const TopNavbar: React.FC<{
  sidebarOpen?: boolean;
  setSidebarOpen?: (val: boolean) => void;
  onOpenUpload?: () => void;
}> = ({ sidebarOpen = true, setSidebarOpen = (_val: boolean) => {}, onOpenUpload }) => {
  const {
    currentUser,
    activeRole,
    setActiveRole,
    darkMode,
    toggleDarkMode,
    companyName,
    setCompanyName,
    employees,
    selectEmployee,
    setActiveTab,
    notifications,
    markNotificationRead,
    isRetraining,
    retrainModels,
    logout,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>(() => {
    return authService.getCustomDemoAccounts() || authService.getDefaultDemoAccounts();
  });
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DemoAccount[]>;
      if (Array.isArray(customEvent.detail)) {
        setDemoAccounts(customEvent.detail);
      }
    };
    window.addEventListener('shopai_demo_accounts_updated', handleUpdate);
    return () => window.removeEventListener('shopai_demo_accounts_updated', handleUpdate);
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setShowCompanyDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? employees
        .filter(
          (e) =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.role.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const companies = [
    'TechSphere Global Enterprise',
    'InovaSys Solutions Corp',
    'FinTech Nexus Corp',
    'Apex BioHealth Innovations',
  ];

  const roles: { role: UserRole; desc: string; icon: React.ElementType }[] = [
    { role: 'HR Admin', desc: 'Full executive control, interventions & exports', icon: Shield },
    { role: 'HR Manager', desc: 'Department analytics, simulations & retention plans', icon: Briefcase },
    { role: 'Analyst', desc: 'Data modeling, risk telemetry & masked compensation', icon: TrendingUp },
    { role: 'Executive / Higher Authority', desc: 'C-Suite board level, financial exposure & strategic controls', icon: Crown },
  ];

  const handleSelectEmployee = (emp: Employee) => {
    selectEmployee(emp);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left side: Mobile menu toggle + Company Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Company Selector */}
        <div className="relative" ref={companyRef}>
          <button
            onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Building className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline-block max-w-[170px] truncate">{companyName}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showCompanyDropdown && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100 z-50">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Organization
              </div>
              {companies.map((comp) => (
                <button
                  key={comp}
                  onClick={() => {
                    setCompanyName(comp);
                    setShowCompanyDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-left transition-colors ${
                    companyName === comp
                      ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{comp}</span>
                  {companyName === comp && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Universal Search */}
      <div className="relative mx-4 flex-1 max-w-md hidden md:block" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, ID, role or department..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute left-0 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {searchResults.length} Employees Found
            </div>
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp)}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 truncate">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {emp.name} <span className="font-mono text-[10px] text-slate-400">({emp.id})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {emp.role} • {emp.department}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          emp.riskLevel === 'high'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : emp.riskLevel === 'medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}
                      >
                        {Math.round(emp.attritionRisk * 100)}% Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                No matching employees found for "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side: ML quick retrain status + Notifications + Dark Mode + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ML Status Indicator */}
        <button
          onClick={() => retrainModels()}
          disabled={isRetraining}
          title="Click to execute real-time model retraining"
          className="hidden lg:flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300 transition-colors"
        >
          <Sparkles className={`h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ${isRetraining ? 'animate-spin' : ''}`} />
          <span className="font-semibold">{isRetraining ? 'Training ML...' : 'XGBoost Active (93.2%)'}</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          aria-label="Toggle color theme"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Notifications & Alerts
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {unreadCount} unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto mt-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`py-2.5 px-1 cursor-pointer transition-colors ${
                      !notif.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {notif.title}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher & Profile */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/90 py-1 pl-1.5 pr-2.5 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 text-xs font-bold ring-1 ring-slate-300 dark:ring-slate-700">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                  {currentUser.role}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>
            </div>
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="border-b border-slate-100 pb-2 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser.email}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Dept: {currentUser.department}
                </div>
              </div>

              <div className="py-2">
                <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  <span>Switch Role Profile</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleDropdown(false);
                      setIsCustomizeModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline normal-case font-bold"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit Names</span>
                  </button>
                </div>

                <div className="space-y-1">
                  {demoAccounts.map((acc) => {
                    const isSelected = activeRole === acc.role || currentUser.role === acc.role;
                    const Icon = acc.isHigherAuthority
                      ? Crown
                      : acc.baseRole === 'HR Admin' || acc.role === 'HR Admin'
                      ? Shield
                      : acc.baseRole === 'Analyst' || acc.role === 'Analyst'
                      ? TrendingUp
                      : Briefcase;

                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setActiveRole(acc.role);
                          setShowRoleDropdown(false);
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-xl p-2 text-left transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        <div
                          className={`mt-0.5 rounded-lg p-1.5 shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold truncate ${
                                isSelected
                                  ? 'text-indigo-700 dark:text-indigo-300'
                                  : 'text-slate-900 dark:text-slate-200'
                              }`}
                            >
                              {acc.role}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate ml-1">{acc.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 line-clamp-1">
                            {acc.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleDropdown(false);
                      setIsCustomizeModalOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 p-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/70 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Customize Names & Roles</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button
                  onClick={() => {
                    setShowRoleDropdown(false);
                    logout();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out of Session
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Lock</span>
                </button>
                <div className="text-center pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                    <UserCheck className="h-3 w-3 text-emerald-500" />
                    Role-Based Security Policy Enforced
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile & Role Customization Modal */}
      <CustomizeProfilesModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        accounts={demoAccounts}
        onSave={(updated) => {
          setDemoAccounts(updated);
        }}
        showToast={showToast}
      />
    </header>
  );
};
