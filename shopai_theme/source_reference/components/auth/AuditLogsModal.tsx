import React, { useState, useEffect } from 'react';
import { Shield, Lock, Clock, AlertTriangle, RefreshCw, X, UserCheck, Key, FileText } from 'lucide-react';
import { authService } from '../../services/authService';
import { AuditLogEntry } from '../../types';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    const data = await authService.getAuditLogs();
    setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                SHOP AI Security & Audit Telemetry
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Higher Authority Clearance
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Immutable audit trail of authentication events, JWT verifications, and elevated access requests
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Refresh logs"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User & Identity</th>
                <th className="px-4 py-3">Clearance Role</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    <div>{log.userName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{log.userEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        log.userRole.includes('Higher Authority')
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {log.userRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded-md ${
                        log.action === 'ELEVATED_ACCESS'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : log.action === 'LOGIN'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{log.details}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No audit records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
          <span>Protected under Enterprise Security Policy • SHOP AI Gateway</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
