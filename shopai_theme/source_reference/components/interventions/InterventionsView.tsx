import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  User,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Intervention } from '../../types';

export const InterventionsView: React.FC = () => {
  const { interventions, updateInterventionStatus, addIntervention, employees, showToast } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [actionTitle, setActionTitle] = useState('');
  const [category, setCategory] = useState('Compensation');
  const [assignedTo, setAssignedTo] = useState('HR People Operations');
  const [costINR, setCostINR] = useState(35000);
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    addIntervention({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      actionTitle: actionTitle || 'Personalized Retention Intervention',
      category,
      assignedTo,
      status: 'In Progress',
      initialRisk: emp.attritionRisk,
      projectedRisk: Math.max(0.1, Math.round(emp.attritionRisk * 0.65 * 100) / 100),
      costINR: Number(costINR),
      notes,
    });

    setIsCreateModalOpen(false);
    setActionTitle('');
    setNotes('');
  };

  const totalCommittedBudget = interventions.reduce((sum, i) => sum + i.costINR, 0);
  const completedCount = interventions.filter((i) => i.status === 'Completed').length;
  const inProgressCount = interventions.filter((i) => i.status === 'In Progress').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Retention Interventions Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor authorized retention actions, track milestone completion, and audit post-intervention risk drops
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Log New Intervention
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Pipeline</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {interventions.length} Interventions
          </div>
          <span className="text-[11px] text-slate-500">Authorized cases</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-400 uppercase font-semibold">In Execution</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {inProgressCount} Cases
          </div>
          <span className="text-[11px] text-slate-500">Underway with managers</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-400 uppercase font-semibold">Completed & Retained</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {completedCount} Resolved
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Flight risk neutralized</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-400 uppercase font-semibold">Committed Budget</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{(totalCommittedBudget / 100000).toFixed(2)} Lakhs
          </div>
          <span className="text-[11px] text-slate-500">Program allocation</span>
        </div>
      </div>

      {/* Interventions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Target Employee</th>
                <th className="py-3 px-3">Intervention Action</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Risk Impact</th>
                <th className="py-3 px-3">Allocated Cost</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {interventions.map((item) => {
                const isCompleted = item.status === 'Completed';
                const isInProgress = item.status === 'In Progress';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{item.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.employeeId} • {item.department}</div>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{item.actionTitle}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.notes}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <span className="text-rose-500 line-through text-[11px]">
                          {Math.round(item.initialRisk * 100)}%
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {Math.round(item.projectedRisk * 100)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      ₹{item.costINR.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : isInProgress
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== 'In Progress' && item.status !== 'Completed' && (
                          <button
                            onClick={() => updateInterventionStatus(item.id, 'In Progress')}
                            className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                          >
                            Start
                          </button>
                        )}
                        {item.status !== 'Completed' && (
                          <button
                            onClick={() => updateInterventionStatus(item.id, 'Completed')}
                            className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            Mark Completed
                          </button>
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

      {/* Manual Intervention Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Log Formal Retention Intervention
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Target Employee
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800 font-medium"
                >
                  {employees
                    .filter((e) => e.riskLevel === 'high' || e.riskLevel === 'medium')
                    .slice(0, 40)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id}) • {emp.department} • {Math.round(emp.attritionRisk * 100)}% Risk
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Action Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., 15% Market Pay Adjustment & Senior Title Elevation"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800"
                  >
                    <option value="Compensation">Compensation</option>
                    <option value="Workload">Workload Reduction</option>
                    <option value="Career Path">Career Progression</option>
                    <option value="Wellbeing">Wellbeing & Flexibility</option>
                    <option value="Managerial">Manager Alignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Estimated Cost (INR)
                  </label>
                  <input
                    type="number"
                    value={costINR}
                    onChange={(e) => setCostINR(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Justification Notes & Milestones
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of agreement with department head and employee..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 shadow-xs"
                >
                  Confirm & Commit Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
