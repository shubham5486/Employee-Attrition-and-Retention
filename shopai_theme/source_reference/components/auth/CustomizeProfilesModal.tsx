import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Shield,
  Briefcase,
  TrendingUp,
  Crown,
  Sparkles,
  User,
  BadgeAlert,
  Info,
} from 'lucide-react';
import { DemoAccount, StandardUserRole } from '../../types';
import { authService } from '../../services/authService';

interface CustomizeProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: DemoAccount[];
  onSave: (updatedAccounts: DemoAccount[]) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  initialSelectedId?: string | null;
}

export const CustomizeProfilesModal: React.FC<CustomizeProfilesModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSave,
  showToast,
  initialSelectedId,
}) => {
  const [profileList, setProfileList] = useState<DemoAccount[]>(() => {
    return JSON.parse(JSON.stringify(accounts));
  });

  if (!isOpen) return null;

  const handleFieldChange = (id: string, field: keyof DemoAccount, value: any) => {
    setProfileList((prev) =>
      prev.map((acc) => {
        if (acc.id !== id) return acc;
        const updated = { ...acc, [field]: value };
        // If baseRole changed, synchronize isHigherAuthority
        if (field === 'baseRole') {
          updated.isHigherAuthority = value === 'Executive / Higher Authority';
        }
        return updated;
      })
    );
  };

  const handleAddCustomProfile = () => {
    const newId = `demo-custom-${Date.now().toString().slice(-4)}`;
    const newAccount: DemoAccount = {
      id: newId,
      name: 'Custom Team Member',
      role: 'Retention Specialist',
      email: `custom.${Date.now().toString().slice(-4)}@shopai.enterprise`,
      passwordHint: 'ShopAI@2026',
      description: 'Custom configured login profile with user-defined name and clearance privileges.',
      badge: 'Custom Profile',
      isHigherAuthority: false,
      baseRole: 'HR Manager',
    };
    setProfileList((prev) => [...prev, newAccount]);
    showToast('Added a new customizable login profile.', 'info');
  };

  const handleRemoveProfile = (id: string) => {
    if (profileList.length <= 1) {
      showToast('You must keep at least one login profile.', 'warning');
      return;
    }
    setProfileList((prev) => prev.filter((acc) => acc.id !== id));
  };

  const handleResetToDefaults = () => {
    const defaults = authService.resetDemoAccounts();
    setProfileList(JSON.parse(JSON.stringify(defaults)));
    onSave(defaults);
    showToast('Reset all login profiles to original system defaults.', 'info');
    onClose();
  };

  const handleSave = () => {
    // Validate that names and roles are not empty
    for (const acc of profileList) {
      if (!acc.name.trim()) {
        showToast('Please provide a name for each profile.', 'warning');
        return;
      }
      if (!acc.role.trim()) {
        showToast('Please provide a role title for each profile.', 'warning');
        return;
      }
    }

    authService.saveDemoAccounts(profileList);
    onSave(profileList);
    showToast('Login names and role titles saved successfully!', 'success');
    onClose();
  };

  const getRoleIcon = (baseRole?: string) => {
    switch (baseRole) {
      case 'HR Admin':
        return Shield;
      case 'Analyst':
        return TrendingUp;
      case 'Executive / Higher Authority':
        return Crown;
      default:
        return Briefcase;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-5 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl border border-slate-800 bg-slate-900 text-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4.5 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Customize Login Names & Roles
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rename profiles like HR Manager, Analyst, or David Rao to your preferred names and job titles.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tip banner */}
        <div className="bg-indigo-950/40 border-b border-indigo-900/40 px-6 py-2.5 flex items-center gap-2.5 text-xs text-indigo-300">
          <Info className="h-4 w-4 shrink-0 text-indigo-400" />
          <span>
            You can give any custom name and custom job title of your choice. Each profile will display your chosen names on the login cards and throughout the system.
          </span>
        </div>

        {/* Profile List Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {profileList.map((account, idx) => {
            const Icon = getRoleIcon(account.baseRole || account.role);
            const isHighlight = initialSelectedId === account.id;

            return (
              <div
                key={account.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isHighlight
                    ? 'border-indigo-500/80 bg-indigo-950/20 ring-1 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-indigo-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      Profile #{idx + 1}: <span className="text-indigo-400">{account.name}</span>
                    </span>
                    {account.isHigherAuthority && (
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        C-Suite / Board Level
                      </span>
                    )}
                  </div>

                  {profileList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProfile(account.id)}
                      className="flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-1 rounded-lg transition-colors"
                      title="Remove profile"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Person Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={account.name}
                      onChange={(e) => handleFieldChange(account.id, 'name', e.target.value)}
                      placeholder="e.g. Gaurav, Alex, Sarah Jenkins"
                      className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Name shown on login button & user profile
                    </span>
                  </div>

                  {/* Role Title field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Role / Job Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={account.role}
                      onChange={(e) => handleFieldChange(account.id, 'role', e.target.value)}
                      placeholder="e.g. HR Manager, Team Lead, Retention Specialist"
                      className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Job title shown on the login button
                    </span>
                  </div>

                  {/* Base System Clearance */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      System Clearance & Permissions
                    </label>
                    <select
                      value={account.baseRole || 'HR Manager'}
                      onChange={(e) =>
                        handleFieldChange(account.id, 'baseRole', e.target.value as StandardUserRole)
                      }
                      className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white focus:border-indigo-500 focus:outline-hidden font-medium"
                    >
                      <option value="HR Admin">Admin Level (Interventions & Full Staff Directory)</option>
                      <option value="HR Manager">Manager Level (Team Diagnostics & Simulations)</option>
                      <option value="Analyst">Analyst Level (Risk Analytics & Masked Salary)</option>
                      <option value="Executive / Higher Authority">
                        Executive / Higher Authority (C-Suite & Financial Liability)
                      </option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Determines what data features this profile can view
                    </span>
                  </div>

                  {/* Corporate Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Login Email
                    </label>
                    <input
                      type="email"
                      required
                      value={account.email}
                      onChange={(e) => handleFieldChange(account.id, 'email', e.target.value)}
                      placeholder="user@shopai.enterprise"
                      className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden font-medium"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Email address used to authenticate
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddCustomProfile}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-3.5 text-xs font-semibold text-indigo-400 hover:border-indigo-500 hover:bg-indigo-950/20 hover:text-indigo-300 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Another Custom Login Profile</span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 bg-slate-900/90 px-6 py-4">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors order-2 sm:order-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Original Defaults</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>Save & Apply Names</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
