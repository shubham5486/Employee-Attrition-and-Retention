import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Sliders,
  TrendingUp,
  Building2,
  Cpu,
  ClipboardCheck,
  FileText,
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Crown,
  LogOut,
  ShieldAlert,
  FileCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  isHigherAuthorityOnly?: boolean;
}

export const Sidebar: React.FC<{
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
  openCsvModal?: () => void;
  onOpenUpload?: () => void;
}> = ({ isOpen: controlledIsOpen, setIsOpen: setControlledIsOpen, openCsvModal, onOpenUpload }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = setControlledIsOpen || setInternalIsOpen;

  const {
    activeTab,
    setActiveTab,
    highRiskCount,
    totalFinancialExposureINR,
    currentUser,
    activeRole,
    logout,
    setIsAuditModalOpen,
  } = useApp();

  const handleOpenUpload = () => {
    if (onOpenUpload) onOpenUpload();
    else if (openCsvModal) openCsvModal();
  };

  const exposureCr = (totalFinancialExposureINR / 10000000).toFixed(1);
  const isHigherAuthority = activeRole === 'Executive / Higher Authority' || currentUser?.isHigherAuthority;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    {
      id: 'risk-table',
      label: 'Employee Risk Analysis',
      icon: Users,
      badge: highRiskCount,
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50',
    },
    { id: 'recommendations', label: 'AI Retention Actions', icon: Lightbulb },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
    {
      id: 'financial',
      label: 'Financial Exposure & ROI',
      icon: TrendingUp,
      isHigherAuthorityOnly: true,
      badge: isHigherAuthority ? 'C-Suite' : 'Restricted',
      badgeColor: isHigherAuthority
        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
        : 'bg-slate-200/80 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    },
    { id: 'departments', label: 'Department Analytics', icon: Building2 },
    {
      id: 'model-studio',
      label: 'ML Model Studio',
      icon: Cpu,
      badge: '94.2% ROC',
      badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50',
    },
    { id: 'interventions', label: 'Active Interventions', icon: ClipboardCheck },
    { id: 'reports', label: 'Reports & Exports', icon: FileText },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 ${
        isOpen ? 'w-64' : 'w-20'
      } lg:static`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <div
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {isOpen && (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-slate-900 dark:text-white text-base">
                  SHOP AI
                </span>
                <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Retention Intelligence
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clearance Banner if Higher Authority */}
      {isOpen && isHigherAuthority && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
              Higher Authority Access
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-sm">
            Board
          </span>
        </div>
      )}

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {isOpen ? 'Main Intelligence' : '•••'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={!isOpen ? item.label : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                }`}
              />
              {isOpen && (
                <div className="flex flex-1 items-center justify-between truncate">
                  <span className="truncate flex items-center gap-1.5">
                    {item.label}
                    {item.isHigherAuthorityOnly && (
                      <Crown className="h-3 w-3 text-amber-500 inline" />
                    )}
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.badgeColor || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Security Audit Log trigger (Higher Authority & Admin) */}
        {(activeRole === 'Executive / Higher Authority' || activeRole === 'HR Admin') && (
          <button
            onClick={() => setIsAuditModalOpen(true)}
            title={!isOpen ? 'Security Audit Telemetry' : undefined}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
            {isOpen && <span className="truncate font-semibold">Security Audit Trail</span>}
          </button>
        )}

        {/* Data Import trigger */}
        <div className="pt-2">
          <button
            onClick={handleOpenUpload}
            title={!isOpen ? 'Import CSV Data' : undefined}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 transition-all border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
          >
            <UploadCloud className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-indigo-400" />
            {isOpen && (
              <span className="truncate font-medium text-indigo-600 dark:text-indigo-400">
                Import CSV Dataset
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Attrition Exposure Widget & Signout */}
      {isOpen ? (
        <div className="p-3 m-3 space-y-2">
          <div className="rounded-2xl bg-gradient-to-br from-rose-50/80 to-amber-50/60 dark:from-rose-950/30 dark:to-amber-950/20 border border-rose-200/70 dark:border-rose-900/40 p-3">
            <div className="flex items-start gap-2.5">
              <div className="rounded-lg bg-rose-500/10 p-1.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  Exposure Alert
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  ₹{exposureCr} Cr
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight mt-0.5">
                  {highRiskCount} high-risk employees
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('simulator')}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-slate-800 border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              Simulate Interventions
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* User Sign Out */}
          <button
            onClick={() => logout()}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out of Session
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400">Lock</span>
          </button>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2">
          <button
            title="Sign Out"
            onClick={() => logout()}
            className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
