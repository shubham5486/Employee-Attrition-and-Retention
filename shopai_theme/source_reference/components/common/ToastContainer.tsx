import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-blue-200 bg-white dark:border-blue-900/60 dark:bg-slate-900';
        let iconClass = 'text-blue-500';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-slate-900';
          iconClass = 'text-emerald-500';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-200 bg-white dark:border-amber-900/60 dark:bg-slate-900';
          iconClass = 'text-amber-500';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-200 bg-white dark:border-rose-900/60 dark:bg-slate-900';
          iconClass = 'text-rose-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-3 shadow-lg shadow-slate-900/5 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
